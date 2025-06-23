import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { userService } from "@/lib/database";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await userService.getUserById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ message: "Error fetching profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    const { 
      name, 
      firstName, 
      lastName, 
      designation, 
      department, 
      companyName, 
      profile_picture_url,
      company_logo_url,
      brand_theme
    } = body;

    // Prepare update data, ensuring no undefined values are sent
    const updateData: Record<string, string | undefined> = {};
    
    if (name !== undefined) updateData.name = name;
    if (firstName !== undefined) updateData.first_name = firstName;
    if (lastName !== undefined) updateData.last_name = lastName;
    if (designation !== undefined) updateData.designation = designation;
    if (department !== undefined) updateData.department = department;
    if (companyName !== undefined) updateData.company_name = companyName;
    if (profile_picture_url !== undefined) updateData.profile_picture_url = profile_picture_url;
    if (company_logo_url !== undefined) updateData.company_logo_url = company_logo_url;
    if (brand_theme !== undefined) updateData.brand_theme = brand_theme;

    // If this is a profile update (not just branding), require name
    if (name !== undefined && !name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }

    const updatedUser = await userService.updateUser(session.user.id, updateData);

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ message: "Error updating profile" }, { status: 500 });
  }
} 