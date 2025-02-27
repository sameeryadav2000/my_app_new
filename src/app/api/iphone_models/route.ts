// route.ts
import { NextResponse, NextRequest } from "next/server";
import { connectToDB } from "../../../../lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const condition = searchParams.get("condition");
  const storage = searchParams.get("storage");

  let query = "";

  try {
    const connection = await connectToDB();

    if (condition && storage) {
      query = `SELECT \`id\`, \`color\`, \`price\` FROM iphone_models WHERE \`iphone_id\` = ${id} AND \`condition\` = '${condition}' AND \`storage\` = '${storage}'`;
    } else if (condition) {
      query = `SELECT DISTINCT \`storage\` FROM iphone_models WHERE \`iphone_id\` = ${id} AND \`condition\` = '${condition}'`;
    } else {
      query = `SELECT DISTINCT \`condition\` FROM iphone_models WHERE \`iphone_id\` = ${id}`;
    }

    const [rows] = await connection.execute(query);
    await connection.end();

    return NextResponse.json({ result: rows });
  } catch (error) {
    console.error("Database query error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
