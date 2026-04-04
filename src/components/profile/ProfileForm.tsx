"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/actions/profile";

interface ProfileFormProps {
  initialName: string | null;
  initialBio: string | null;
  email: string;
}

export function ProfileForm({ initialName, initialBio, email }: ProfileFormProps) {
  const [name, setName] = useState(initialName || "");
  const [bio, setBio] = useState(initialBio || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    const result = await updateProfile(name, bio);

    setIsLoading(false);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || "Failed to update profile");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Display Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Input
          id="bio"
          type="text"
          placeholder="A short bio about yourself"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          disabled={isLoading}
          maxLength={250}
        />
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}

      {success && (
        <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded p-2">
          Profile updated successfully
        </div>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}
