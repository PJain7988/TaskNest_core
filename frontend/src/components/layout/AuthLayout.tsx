import { Outlet, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function AuthLayout() {
  const { token } = useAuth();

  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative bg-background overflow-hidden">

      {/* LEFT – Branding */}
      <div
        className="hidden lg:flex flex-col justify-between relative px-14 py-12 text-white
        bg-gradient-to-br from-indigo-700 via-violet-700 to-indigo-900
        border-r border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Depth overlay */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />

        {/* Content wrapper */}
        <div className="relative z-10 flex flex-col justify-between h-full">

          {/* Logo Section */}
          <div className="flex items-center gap-1">
            <div className="flex items-center justify-center bg-white/10 backdrop-blur-md rounded-xl p-1 shadow-md">
              <img
                src="/logo.png"
                alt="TaskNest Logo"
                className="h-16 w-auto object-contain scale-110"
              />
            </div>

            <span className="text-3xl font-semibold tracking-tight">
              TaskNest
            </span>
          </div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h1 className="text-5xl font-semibold leading-tight tracking-tight">
              Connect.<br />
              Collaborate.<br />
              Create.
            </h1>

            <p className="text-white/80 text-lg leading-relaxed max-w-md">
              A modern collaboration platform where ideas turn into real-world
              projects. Build your network, showcase your skills, and grow faster.
            </p>

            {/* Features */}
            <div className="space-y-2 text-white/70 text-sm">
              <p>✔ Real-time collaboration</p>
              <p>✔ Smart task management</p>
              <p>✔ Community-driven projects</p>
            </div>
          </motion.div>

          {/* Footer */}
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} TaskNest — Built for innovators
          </p>
        </div>
      </div>

      {/* RIGHT – Form Section */}
      <div className="flex items-center justify-center px-6 py-10 bg-background/60 relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="relative bg-card/80 backdrop-blur-2xl border border-border/60 shadow-[0_20px_60px_rgba(0,0,0,0.35)] rounded-3xl p-8 overflow-hidden">

            {/* Top accent */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-primary rounded-t-3xl" />

            {/* Mobile Logo */}
            <div className="flex items-center gap-3 mb-8 lg:hidden">
              <div className="bg-primary/10 p-2 rounded-lg">
                <img
                  src="/logo.png"
                  alt="TaskNest Logo"
                  className="h-12 w-auto object-contain"
                />
              </div>

              <span className="text-2xl font-semibold tracking-tight text-foreground">
                TaskNest
              </span>
            </div>

            {/* Form Content */}
            <Outlet />
          </div>
        </motion.div>
      </div>
    </div>
  );
}