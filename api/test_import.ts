import authRoutes from '../server/routes/auth.ts';

export default function handler(req: any, res: any) {
  res.status(200).json({ status: "success", message: "Imported authRoutes successfully!" });
}
