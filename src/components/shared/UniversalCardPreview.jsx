import React, { useEffect, useState, useRef } from "react";
import { User, Building, Eye, Loader2 } from "lucide-react";
import { CARD_TEMPLATES } from "../../constants/cardTemplates";

/* ==================== UTILITY FUNCTION ==================== */
function adjustColorBrightness(color, percent) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0xff) + amt;
  const B = (num & 0xff) + amt;
  return (
    "#" +
    (
      0x1000000 +
      (Math.min(255, Math.max(0, R)) << 16) +
      (Math.min(255, Math.max(0, G)) << 8) +
      Math.min(255, Math.max(0, B))
    )
      .toString(16)
      .slice(1)
  );
}

function getTemplateStyles(profile, selectedTemplate) {
  const isDev = import.meta.env.DEV;

  if (isDev) {
    console.log("🎨 [UniversalCardPreview] Input:", {
      selectedTemplate,
      profileTemplate: profile?.template,
      designMode: profile?.designMode,
      hasCustom: !!profile?.customDesignUrl,
      hasAI: !!profile?.aiBackground,
      hasColor: !!profile?.color,
    });
  }

  // PRIORITY 1: Custom Upload (always shows if exists)
  if (profile?.customDesignUrl) {
    if (isDev) console.log("✅ [Priority 1] Custom Upload");
    return {
      style: {
        backgroundImage: `url(${profile.customDesignUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      },
      textColor: "text-white",
      overlay: "from-black/60 to-black/30",
    };
  }

  // PRIORITY 2: AI Background (always shows if exists)
  if (profile?.aiBackground) {
    if (isDev) console.log("✅ [Priority 2] AI Background");
    return {
      style: {
        backgroundImage: `url(${profile.aiBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      },
      textColor: "text-white",
      overlay: "from-black/40 to-black/20",
    };
  }

  // PRIORITY 3: Manual Color (only if explicitly in manual mode with color)
  if (profile?.designMode === "manual" && profile?.color) {
    if (isDev) console.log("✅ [Priority 3] Manual Color:", profile.color);
    const color = profile.color;
    return {
      style: {
        background: `linear-gradient(135deg, ${color} 0%, ${adjustColorBrightness(
          color,
          -30
        )} 100%)`,
      },
      textColor: "text-white",
      overlay: "from-black/10 to-transparent",
    };
  }

  // PRIORITY 4: Template (use profile.template OR selectedTemplate)
  // This now comes AFTER manual color check to prevent override
  const templateToUse = profile?.template || selectedTemplate;

  if (templateToUse && CARD_TEMPLATES[templateToUse]?.fullImage) {
    const template = CARD_TEMPLATES[templateToUse];
    if (isDev) console.log("✅ [Priority 4] Template:", templateToUse);
    return {
      style: {
        backgroundImage: `url(${template.fullImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      },
      textColor: "text-white",
      overlay: "from-black/30 to-transparent",
    };
  }

  // FINAL FALLBACK: LinkMe Blue
  if (isDev) console.log("✅ [Fallback] LinkMe Blue");
  return {
    style: { backgroundColor: "#0066ff" },
    textColor: "text-white",
    overlay: "from-black/10 to-transparent",
  };
}

/* ==================== MAIN COMPONENT ==================== */
export default function UniversalCardPreview({
  profile,
  profileType,
  selectedTemplate,
  className = "",
  showLoading = true,
  showViewCount = false,
}) {
  const [imageLoading, setImageLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isMountedRef = useRef(true);

  // Early return if no profile
  if (!profile) {
    return (
      <div className="w-full max-w-[360px] aspect-[1.586/1] rounded-[24px] bg-gray-200 animate-pulse" />
    );
  }

  // Determine profile type
  const isPersonal =
    profileType === "personal" || profile?.profileType === "personal";

  // Get template styles
  const templateStyles = getTemplateStyles(profile, selectedTemplate);

  // Determine background URL
  const templateToUse = profile?.template || selectedTemplate;
  const backgroundUrl =
    profile?.customDesignUrl ||
    profile?.aiBackground ||
    (templateToUse ? CARD_TEMPLATES[templateToUse]?.fullImage : null);

  // Check if we're using an image-based background
  const hasBackgroundImage = !!backgroundUrl;

  // Reset loading states when background URL changes
  useEffect(() => {
    isMountedRef.current = true;

    // Reset states immediately when URL changes
    setImageLoaded(false);
    setImageError(false);

    if (hasBackgroundImage && backgroundUrl) {
      setImageLoading(true);

      const img = new Image();
      let timeoutId;

      img.onload = () => {
        if (isMountedRef.current) {
          clearTimeout(timeoutId); // ✅ Clear timeout on success
          setImageLoading(false);
          setImageLoaded(true);
          setImageError(false);
        }
      };

      img.onerror = () => {
        if (isMountedRef.current) {
          clearTimeout(timeoutId); // ✅ Clear timeout on error too
          setImageLoading(false);
          setImageLoaded(false);
          setImageError(true);
        }
      };

      // Start loading
      img.src = backgroundUrl;

      // Timeout fallback - only if image neither loads nor errors
      timeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          setImageLoading(false);
          setImageError(true);
        }
      }, 30000);

      return () => {
        isMountedRef.current = false;
        clearTimeout(timeoutId); // ✅ Clear on unmount
      };
    } else {
      // No background image needed
      setImageLoading(false);
      setImageLoaded(false);
      setImageError(false);
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [backgroundUrl, hasBackgroundImage]);
  return (
    <div
      className={`
        relative w-full max-w-[360px] aspect-[1.586/1]
        rounded-[24px] shadow-2xl overflow-hidden transition-all
        ${className}
      `}
      style={templateStyles.style}
    >
      {/* Loading Overlay */}
      {showLoading && imageLoading && hasBackgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
            <p className="text-white text-xs font-medium">Loading Design...</p>
            <p className="text-white/70 text-[10px] mt-1">
              This may take a few moments
            </p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {showLoading && imageError && hasBackgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/90 to-orange-900/90 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="text-center px-4">
            <p className="text-white text-xs font-medium">
              Failed to load design
            </p>
            <p className="text-white/70 text-[10px] mt-1">Using fallback</p>
          </div>
        </div>
      )}

      {/* Background Overlay */}
      {templateStyles.overlay && (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${templateStyles.overlay}`}
        />
      )}

      {/* CONTENT */}
      <div
        className={`relative z-10 h-full flex flex-col justify-between px-5 py-4 ${templateStyles.textColor}`}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          {profile?.image || profile?.avatarUrl ? (
            <img
              src={profile.image || profile.avatarUrl}
              alt="Profile"
              className={`w-12 h-12 object-cover border-2 ${
                isPersonal ? "rounded-full" : "rounded-lg"
              } shadow-lg`}
            />
          ) : (
            <div
              className={`w-12 h-12 flex items-center justify-center border-2 ${
                isPersonal ? "rounded-full" : "rounded-lg"
              } bg-white/20 backdrop-blur-sm`}
            >
              {isPersonal ? (
                <User className="w-6 h-6" />
              ) : (
                <Building className="w-6 h-6" />
              )}
            </div>
          )}

          <div>
            <p className="text-sm font-semibold opacity-90">.LinkMe</p>
            <p className="text-xs opacity-70">Smart NFC Digital Identity</p>
          </div>
        </div>

        {/* Main Content */}
        <div>
          <h3 className="text-lg font-bold tracking-tight">
            {profile?.name || "Your Name"}
          </h3>
          <p className="text-xs opacity-80">
            {profile?.title || "Your role or title"}
          </p>
          <p className="text-[11px] opacity-75 line-clamp-2">
            {profile?.bio || "This is a preview of your smart identity card."}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 text-[10px]">
          <span className="px-2 py-1 rounded-full bg-black/20 text-white">
            {isPersonal ? "Personal" : "Business"}
          </span>
          {showViewCount ? (
            <span className="px-2 py-1 rounded-full bg-black/20 text-white flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {profile?.viewCount || 0}
            </span>
          ) : (
            <span className="px-2 py-1 rounded-full bg-black/20 text-white">
              NFC • QR
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
