"use client"

import { useState } from "react"
import { YoastHeadJson } from "@/lib/wordpress-api"
import { Globe, Search, Facebook, Twitter, ExternalLink } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface MetadataPreviewProps {
  metadata?: YoastHeadJson
  className?: string
}

export function MetadataPreview({ metadata, className }: MetadataPreviewProps) {
  const [activeTab, setActiveTab] = useState<"google" | "facebook" | "twitter">("google")

  if (!metadata) {
    return (
      <div className={cn("p-6 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20", className)}>
        <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Aucune métadonnée SEO disponible pour la prévisualisation</p>
      </div>
    )
  }

  const title = metadata.title || metadata.og_title || "Sans titre"
  const description = metadata.description || metadata.og_description || "Aucune description disponible."
  const url = metadata.og_url || "https://cafe-citoyen.fr"
  const siteName = metadata.og_site_name || metadata.title?.split('-').pop()?.trim() || "Café Citoyen"
  const image = metadata.og_image?.[0]?.url
  
  // Default fallback image if none provided
  const displayImage = image || "/placeholder.svg"

  const domain = tryGetDomain(url)

  return (
    <div className={cn("w-full bg-card text-card-foreground rounded-lg border shadow-sm", className)}>
      <div className="p-4 border-b flex items-center justify-between bg-muted/40 rounded-t-lg">
        <h3 className="font-semibold text-sm flex items-center gap-2">
            <Search className="w-4 h-4" />
            Prévisualisation SEO
        </h3>
        <div className="flex bg-muted rounded-md p-1">
            <TabButton 
                active={activeTab === 'google'} 
                onClick={() => setActiveTab('google')}
                icon={<Globe className="w-3 h-3 mr-1.5" />}
                label="Google"
            />
            <TabButton 
                active={activeTab === 'facebook'} 
                onClick={() => setActiveTab('facebook')}
                icon={<Facebook className="w-3 h-3 mr-1.5" />}
                label="Facebook"
            />
            <TabButton 
                active={activeTab === 'twitter'} 
                onClick={() => setActiveTab('twitter')}
                icon={<Twitter className="w-3 h-3 mr-1.5" />}
                label="Twitter"
            />
        </div>
      </div>

      <div className="p-6 overflow-hidden bg-white/5 dark:bg-black/5 min-h-[300px] flex items-center justify-center">
        
        {/* Google Preview */}
        {activeTab === 'google' && (
            <div className="w-full max-w-[600px] bg-white p-4 rounded shadow-sm font-sans text-left">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center p-1 border">
                        <img src="/favicon.ico" alt="" className="w-4 h-4 opacity-60" onError={(e) => e.currentTarget.style.display = 'none'} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-[#202124] leading-tight">{siteName}</span>
                        <span className="text-xs text-[#202124] leading-tight flex items-center gap-1">
                            {url}
                            <span className="text-gray-500">› ...</span> 
                        </span>
                    </div>
                </div>
                <div className="mb-1">
                    <h3 className="text-[20px] text-[#1a0dab] hover:underline cursor-pointer leading-[1.3] truncate">
                        {title}
                    </h3>
                </div>
                <div className="text-[14px] text-[#4d5156] leading-[1.58] line-clamp-2">
                    {description}
                </div>
            </div>
        )}

        {/* Facebook Preview */}
        {activeTab === 'facebook' && (
            <div className="w-full max-w-[500px] bg-[#f0f2f5] border border-[#dadde1] rounded-lg overflow-hidden font-sans text-left">
                 <div className="relative aspect-[1.91/1] w-full bg-gray-200 overflow-hidden border-b border-[#dadde1]">
                    {image ? (
                        <Image 
                            src={image} 
                            alt={title}
                            fill 
                            className="object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            No Image
                        </div>
                    )}
                </div>
                <div className="bg-[#f0f2f5] p-3 border-t border-[#dadde1]">
                    <div className="uppercase text-[12px] text-[#65676B] mb-1 truncate">
                        {domain}
                    </div>
                    <div className="text-[16px] text-[#050505] font-bold leading-tight mb-1 line-clamp-2">
                        {title}
                    </div>
                    <div className="text-[14px] text-[#65676B] line-clamp-1">
                        {description}
                    </div>
                </div>
            </div>
        )}

        {/* Twitter Preview */}
        {activeTab === 'twitter' && (
            <div className="w-full max-w-[440px] border border-[#cfd9de] rounded-[12px] overflow-hidden bg-white font-sans text-left">
                <div className="relative aspect-[2/1] w-full bg-gray-200">
                    {image ? (
                        <Image 
                            src={image} 
                            alt={title}
                            fill 
                            className="object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                             No Image
                        </div>
                    )}
                </div>
                <div className="p-3">
                    <div className="uppercase text-[13px] text-[#536471] mb-0.5 truncate">
                        {domain}
                    </div>
                     <div className="text-[15px] text-[#0f1419] font-normal leading-5 line-clamp-2 mb-1">
                        {title}
                    </div>
                     <div className="text-[15px] text-[#536471] leading-5 line-clamp-2">
                        {description}
                    </div>
                </div>
            </div>
        )}

      </div>
      
      <div className="p-3 bg-muted/20 border-t text-xs text-muted-foreground flex justify-between items-center">
         <span>Aperçu approximatif basé sur les métadonnées Yoast.</span>
         {metadata.robots && (
             <div className="flex gap-2">
                  <span className={cn("px-1.5 py-0.5 rounded border", metadata.robots.index === "index" ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200")}>
                      {metadata.robots.index}
                  </span>
                  <span className={cn("px-1.5 py-0.5 rounded border", metadata.robots.follow === "follow" ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200")}>
                      {metadata.robots.follow}
                  </span>
             </div>
         )}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon?: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center px-3 py-1.5 text-xs font-medium rounded-sm transition-all",
                active 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
            )}
        >
            {icon}
            {label}
        </button>
    )
}

function tryGetDomain(url: string) {
  try {
    return new URL(url).hostname
  } catch {
    return ""
  }
}
