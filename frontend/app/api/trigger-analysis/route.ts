import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { filePath, fileName, fileSize, fileType } = body;

        if (!filePath || !fileName) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Verify User Session
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Send event to Inngest
        await inngest.send({
            name: "app/document.uploaded",
            data: {
                filePath,
                fileName,
                fileSize,
                fileType,
                userId: user.id
            },
        });

        return NextResponse.json({ success: true, message: "Analysis triggered" });
    } catch (error) {
        console.error("Trigger error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
