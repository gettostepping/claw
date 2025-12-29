import { initializeAdmin } from "@/lib/initialize-admin";

export default async function AdminInitPage() {
  await initializeAdmin();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Admin Initialization</h1>
        <p className="text-lg text-neutral-400">Admin user has been initialized.</p>
        <p className="text-sm text-neutral-500 mt-4">Check the server console for details.</p>
      </div>
    </div>
  );
}