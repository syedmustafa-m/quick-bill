import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { filename, folder = 'avatars' } = await request.json();

    if (!filename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 });
    }

    // Validate folder to prevent security issues
    const allowedFolders = ['avatars', 'logos'];
    if (!allowedFolders.includes(folder)) {
      return NextResponse.json({ error: "Invalid folder specified" }, { status: 400 });
    }

    const userId = session.user.id;
    const fileExtension = filename.split('.').pop();
    const fileName = folder === 'avatars' ? 'avatar' : 'logo';
    const filePath = `${userId}/${fileName}.${fileExtension}`;

    const { data, error } = await supabaseAdmin.storage
      .from(folder)
      .createSignedUploadUrl(filePath, {
        upsert: true,
      });

    if (error) {
      console.error("Error creating signed upload URL:", error);
      return NextResponse.json({ error: "Could not create upload URL." }, { status: 500 });
    }

    // The path is needed on the client to construct the final public URL
    return NextResponse.json({ ...data, path: filePath }, { status: 200 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 