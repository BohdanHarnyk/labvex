import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bs58 from "bs58";
import nacl from "tweetnacl";

const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
} else {
  console.warn("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing. Google Login will be disabled.");
}

providers.push(
  CredentialsProvider({
    id: "solana",
    name: "Solana",
    credentials: {
      message: { label: "Message", type: "text" },
      signature: { label: "Signature", type: "text" },
      publicKey: { label: "Public Key", type: "text" },
    },
    async authorize(credentials) {
      if (!credentials?.message || !credentials?.signature || !credentials?.publicKey) {
        return null;
      }

      try {
        // Verify the signature
        const signatureUint8 = bs58.decode(credentials.signature);
        const messageUint8 = new TextEncoder().encode(credentials.message);
        const pubKeyUint8 = bs58.decode(credentials.publicKey);

        const isValid = nacl.sign.detached.verify(messageUint8, signatureUint8, pubKeyUint8);

        if (!isValid) {
          return null;
        }

        // Find or create user
        let user = await prisma.user.findUnique({
          where: { walletAddress: credentials.publicKey },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              walletAddress: credentials.publicKey,
              username: "sol_" + credentials.publicKey.substring(0, 8) + "_" + Math.floor(Math.random() * 1000),
              displayName: "Web3 Researcher",
              role: "GUEST",
            },
          });
        }

        return {
          id: user.id,
          name: user.displayName,
          email: user.email,
          image: user.avatarUrl,
        };
      } catch (e) {
        console.error("Solana NextAuth authorization error:", e);
        return null;
      }
    },
  })
);

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email;
        if (!email) return false;

        let dbUser = await prisma.user.findFirst({
          where: { email: email },
        });

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: email,
              username: email.split("@")[0] + "_" + Math.floor(Math.random() * 1000),
              displayName: user.name || "New Researcher",
              role: "GUEST",
            },
          });
        }
        
        user.id = dbUser.id;
        return true;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        });
        if (dbUser) {
          // @ts-ignore
          session.user.id = dbUser.id;
          // @ts-ignore
          session.user.username = dbUser.username;
          // @ts-ignore
          session.user.walletAddress = dbUser.walletAddress;
          // @ts-ignore
          session.user.role = dbUser.role;
          // @ts-ignore
          session.user.reputationScore = dbUser.reputationScore;
          // @ts-ignore
          session.user.isOnboarded = dbUser.isOnboarded;
        }
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "super-secret-random-string-for-labvex-auth",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
