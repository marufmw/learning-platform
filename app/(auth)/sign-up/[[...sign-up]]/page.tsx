import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <SignUp
      signInUrl="/sign-in"
      appearance={{
        baseTheme: "dark",
        elements: {
          rootBox: "w-full",
          card: "bg-gray-900 border border-gray-800",
          headerTitle: "text-white",
          headerSubtitle: "text-gray-400",
          socialButtonsBlockButton: "bg-gray-800 border-gray-700 text-white hover:bg-gray-700",
          socialButtonsBlockButtonText: "text-white",
          dividerLine: "bg-gray-800",
          dividerText: "text-gray-400",
          formFieldLabel: "text-gray-300",
          formFieldInput: "bg-gray-800 border-gray-700 text-white placeholder-gray-500",
          formFieldInputShowPasswordButton: "text-gray-400",
          footerActionText: "text-gray-400",
          footerActionLink: "text-blue-500 hover:text-blue-400",
          formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
          identityPreviewText: "text-gray-300",
          identityPreviewEditButton: "text-blue-500",
        },
      }}
    />
  );
}
