import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { processAndMarkMediaUsed } from "../utils/cleanup.js";

/**
   GET /blogs
   Fetch paginated list of live blogs (public)
 */
export const getBlogs = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const [blogsList, totalCount] = await Promise.all([
      prisma.blogs.findMany({
        where: { deleted_at: null },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
        include: {
          original_author: {
            select: {
              user_id: true,
              name: true,
              avatar_url: true,
            },
          },
        },
      }),
      prisma.blogs.count({
        where: { deleted_at: null },
      }),
    ]);

    const hasMore = skip + blogsList.length < totalCount;

    return res.json({
      success: true,
      blogs: blogsList,
      totalCount,
      hasMore,
      page,
      limit,
    });
  } catch (error: any) {
    console.error("Error in getBlogs:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};

/**
   GET /blogs/:slug
   Fetch a single blog by slug (public). Increments view_count.
 */
export const getBlogBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const blog = await prisma.blogs.findFirst({
      where: {
        slug: String(slug),
        deleted_at: null,
      },
      include: {
        original_author: {
          select: {
            user_id: true,
            name: true,
            avatar_url: true,
          },
        },
      },
    });

    if (!blog) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    // Increment view count asynchronously
    prisma.blogs
      .update({
        where: { blog_id: blog.blog_id },
        data: { view_count: { increment: 1 } },
      })
      .catch((err) => console.error("Failed to increment blog view count:", err));

    return res.json({
      success: true,
      blog: {
        ...blog,
        view_count: blog.view_count + 1,
      },
    });
  } catch (error: any) {
    console.error("Error in getBlogBySlug:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};

/**
   POST /blogs
   Create a new blog post (authenticated user)
 */
export const createBlog = async (req: any, res: Response) => {
  try {
    const { title, description, content } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const authorId = Number(req.user.user_id);

    // Generate unique slug
    let baseSlug = title
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "-");
    if (!baseSlug) baseSlug = "untitled-blog";

    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await prisma.blogs.findFirst({
        where: { slug },
      });
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newBlog = await prisma.blogs.create({
      data: {
        title,
        description: description || null,
        slug,
        content: content || null,
        original_author_id: authorId,
      },
      include: {
        original_author: {
          select: {
            user_id: true,
            name: true,
            avatar_url: true,
          },
        },
      },
    });

    await processAndMarkMediaUsed(content);

    return res.status(201).json({
      success: true,
      blog: newBlog,
    });
  } catch (error: any) {
    console.error("Error in createBlog:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};

/**
   PUT /blogs/:slug
   Update a blog post (authenticated user)
 */
export const updateBlog = async (req: any, res: Response) => {
  try {
    const { slug } = req.params;
    const { title, description, content } = req.body;

    const blog = await prisma.blogs.findFirst({
      where: {
        slug: String(slug),
        deleted_at: null,
      },
    });

    if (!blog) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    const userId = Number(req.user.user_id);
    const userRole = req.user.role;

    // Only original author, moderator or admin can edit
    const isAuthor = blog.original_author_id === userId;
    const isAdminOrMod = userRole === "admin" || userRole === "moderator";

    if (!isAuthor && !isAdminOrMod) {
      return res.status(403).json({ error: "You do not have permission to edit this blog post" });
    }

    // Generate unique slug if title has changed
    let updatedSlug = blog.slug;
    if (title && title.trim() !== blog.title) {
      let baseSlug = title
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "-");
      if (!baseSlug) baseSlug = "untitled-blog";

      updatedSlug = baseSlug;
      let counter = 1;
      while (true) {
        const existing = await prisma.blogs.findFirst({
          where: {
            slug: updatedSlug,
            NOT: { blog_id: blog.blog_id },
          },
        });
        if (!existing) break;
        updatedSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    const updatedBlog = await prisma.blogs.update({
      where: { blog_id: blog.blog_id },
      data: {
        title: title !== undefined ? title : blog.title,
        description: description !== undefined ? description : blog.description,
        content: content !== undefined ? content : blog.content,
        slug: updatedSlug,
        updated_by: userId,
      },
      include: {
        original_author: {
          select: {
            user_id: true,
            name: true,
            avatar_url: true,
          },
        },
      },
    });

    await processAndMarkMediaUsed(content !== undefined ? content : blog.content);

    return res.json({
      success: true,
      blog: updatedBlog,
    });
  } catch (error: any) {
    console.error("Error in updateBlog:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};

/**
   DELETE /blogs/:slug
   Delete a blog post (authenticated user, soft delete)
 */
export const deleteBlog = async (req: any, res: Response) => {
  try {
    const { slug } = req.params;

    const blog = await prisma.blogs.findFirst({
      where: {
        slug: String(slug),
        deleted_at: null,
      },
    });

    if (!blog) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    const userId = Number(req.user.user_id);
    const userRole = req.user.role;

    // Only original author, moderator or admin can delete
    const isAuthor = blog.original_author_id === userId;
    const isAdminOrMod = userRole === "admin" || userRole === "moderator";

    if (!isAuthor && !isAdminOrMod) {
      return res.status(403).json({ error: "You do not have permission to delete this blog post" });
    }

    await prisma.blogs.update({
      where: { blog_id: blog.blog_id },
      data: {
        deleted_at: new Date(),
        updated_by: userId,
      },
    });

    return res.json({
      success: true,
      message: "Blog post deleted successfully",
    });
  } catch (error: any) {
    console.error("Error in deleteBlog:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};
