import { redirect } from "next/navigation";
import { getProfile } from "@/actions/profile";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default async function ProfilePage() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your profile information
          </p>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <ProfileForm
            initialName={profile.name}
            initialBio={profile.bio}
            email={profile.email}
          />
        </div>

        <div className="text-center">
          <a href="/" className="text-sm text-muted-foreground hover:underline">
            ← Back to app
          </a>
        </div>
      </div>
    </div>
  );
}
