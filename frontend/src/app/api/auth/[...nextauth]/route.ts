import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/config";

// Use exported config to create handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
