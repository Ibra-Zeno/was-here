import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { options } from "../auth/[...nextauth]";

export default async function handle(req, res) {
  try {
    // Input validation
    const { title, content } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required." });
    }

    // Get cookies from the request
    const cookies = req.headers.cookie;

    const session = await getServerSession(req, res, options);
    // console.log(session);

    if (!session || !session.user || !session.user.email) {
      return res.status(401).json({ error: "User not authenticated." });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Create post using the user's ID
    const result = await prisma.post.create({
      data: {
        title: title,
        content: content || null,
        authorId: user.id,
      },
    });

    // Respond with success
    res
      .status(201)
      .json({ message: "Post created successfully.", post: result });
  } catch (error) {
    // Error handling
    console.error("Error creating post:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the post." });
  }
}
