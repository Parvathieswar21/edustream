export default function handler(req: any, res: any) {
  res.status(200).json({
    status: "ok",
    message: "Test endpoint working!",
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL
    }
  });
}
