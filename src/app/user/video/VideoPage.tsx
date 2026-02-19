"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandsClapping } from "@fortawesome/free-solid-svg-icons";
import {
  Play, Send, Smile, Eye,
  Search,
  MonitorPlay, X,
  MapPin,
  ChevronRight,
  User,
  MessageSquare,
  Briefcase,
  Globe,
  Megaphone,
  Phone,
  MessageCircle,
} from "lucide-react";

export default function VideoPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [viewCounts, setViewCounts] = useState<{ [key: string]: number }>({});
  const searchParams = useSearchParams();
  const videoId = searchParams.get("vid");

  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<{ [key: string]: number }>({});
  const [commentCounts, setCommentCounts] = useState<{ [key: string]: number }>({});
  const [comments, setComments] = useState<{ [key: string]: any[] }>({});
  const [user, setUser] = useState<any>(null);
  const [soundOn, setSoundOn] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const [commentModal, setCommentModal] = useState<{ open: boolean; videoId: string | null }>({
    open: false,
    videoId: null,
  });

  const [newComment, setNewComment] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All Sectors");
  const [selectedArea, setSelectedArea] = useState("All Areas");

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setSoundOn(false);
  }, [activeIndex]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    const fetchAllVideos = async () => {
      setLoading(true);

      const { data: registerData } = await supabase
        .from("vendor_register")
        .select("id, company_name, video_files, sector, area, mobile_number, websites, user_type, created_at")
        .not("video_files", "is", null);

      const { data: standaloneData } = await supabase.from("vendor_videos").select("*");

      const normalizedRegister = (registerData || []).flatMap((vendor: any) => {
        if (!Array.isArray(vendor.video_files)) return [];

        return vendor.video_files.map((video: any, index: number) => {
          const ytMatch = video.url?.match(
            /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
          );
          const ytId = ytMatch && ytMatch[2]?.length === 11 ? ytMatch[2] : null;

          return {
            ...video,
            uniqueId: `reg-${vendor.id}-${index}`,
            title: vendor.company_name || "Company Showcase",
            vendorId: vendor.id,
            sector: vendor.sector || "General",
            area: vendor.area || "N/A",
            mobile_number: vendor.mobile_number,
            websites: vendor.websites || [],
            user_type: vendor.user_type || [],
            isYouTube: !!ytId,
            ytId,
            source: "register",
            isAd: false,
            created_at: vendor.created_at, // Use vendor's created_at for sorting
          };
        });
      });

      const normalizedStandalone = (standaloneData || []).map((video: any) => {
        const ytMatch = video.video_url?.match(
          /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
        );
        const ytId = ytMatch && ytMatch[2]?.length === 11 ? ytMatch[2] : null;

        return {
          uniqueId: `sta-${video.id}`,
          title: video.video_title || "Official Tutorial",
          url: video.video_url,
          vendorId: null,
          sector: Array.isArray(video.business_sector)
            ? video.business_sector[0]
            : video.business_sector || "General",
          area: video.area || "N/A",
          mobile_number: null,
          websites: [],
          user_type: [],
          isYouTube: !!ytId,
          ytId,
          source: "standalone",
          isAd: true,
          created_at: video.created_at, // Use video's created_at for sorting
        };
      });

      const allVideos = [...normalizedRegister, ...normalizedStandalone];

      // Sort by latest uploaded (descending order)
      allVideos.sort(
        (a, b) =>
          new Date(b.created_at || "1970-01-01").getTime() -
          new Date(a.created_at || "1970-01-01").getTime()
      );

      setVideos(allVideos);

      await fetchLikesAndComments(allVideos);
      setLoading(false);
    };

    fetchUser();
    fetchAllVideos();

    return () => window.removeEventListener("resize", checkMobile);
  }, [user?.id]);


  useEffect(() => {
    const activeVid = filteredVideos[activeIndex];
    if (!activeVid) return;

    const saveView = async () => {
      await supabase.from("video_views").insert({
        video_unique_id: activeVid.uniqueId,
        user_id: user ? user.id : null,
      });

      fetchLikesAndComments(videos);
    };

    saveView();
  }, [activeIndex, user, videos]);


  const fetchLikesAndComments = async (videos: any[]) => {
    const videoIds = videos.map((v) => v.uniqueId);

    // Fetch likes
    const { data: likesData } = await supabase
      .from("video_likes")
      .select("video_unique_id, user_id")
      .in("video_unique_id", videoIds);

    const likesSet = new Set<string>();
    const counts: { [key: string]: number } = {};

    likesData?.forEach((like) => {
      if (user && like.user_id === user.id) likesSet.add(like.video_unique_id);

      counts[like.video_unique_id] = (counts[like.video_unique_id] || 0) + 1;
    });

    setLikedVideos(likesSet);
    setLikeCounts(counts);

    // Fetch comments
    const { data: commentsData } = await supabase
      .from("video_comments")
      .select("video_unique_id, comment, created_at, user_id, guest_name, guest_phone")
      .in("video_unique_id", videoIds)
      .order("created_at", { ascending: false });

    const commentMap: { [key: string]: any[] } = {};
    const commentCountsMap: { [key: string]: number } = {};

    commentsData?.forEach((comment) => {
      if (!commentMap[comment.video_unique_id]) commentMap[comment.video_unique_id] = [];
      commentMap[comment.video_unique_id].push(comment);

      commentCountsMap[comment.video_unique_id] =
        (commentCountsMap[comment.video_unique_id] || 0) + 1;
    });

    setComments(commentMap);
    setCommentCounts(commentCountsMap);


    // Fetch views count
    const { data: viewsData } = await supabase
      .from("video_views")
      .select("video_unique_id")
      .in("video_unique_id", videoIds);

    const viewMap: { [key: string]: number } = {};

    viewsData?.forEach((v) => {
      viewMap[v.video_unique_id] = (viewMap[v.video_unique_id] || 0) + 1;
    });

    setViewCounts(viewMap);

  };


  const handleShare = async (video: any) => {
    try {
      const shareUrl = `${window.location.origin}/user/video?vid=${video.uniqueId}`; // Changed from /user/videos to /user/video

      if (navigator.share) {
        await navigator.share({
          title: video.title,
          text: `Check out this video: ${video.title}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Page link copied!");
      }
    } catch (error) {
      toast.error("Sharing failed!");
    }
  };



  const filteredVideos = videos.filter((v) => {
    const matchesSearch = v.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = selectedSector === "All Sectors" || v.sector === selectedSector;
    const matchesArea = selectedArea === "All Areas" || v.area === selectedArea;
    return matchesSearch && matchesSector && matchesArea;
  });

  const sectors = ["All Sectors", ...new Set(videos.flatMap((v) => v.sector).filter(Boolean))];
  const areas = ["All Areas", ...new Set(videos.map((v) => v.area).filter(Boolean))];

  const toggleLike = async (uniqueId: string) => {
    if (!user) {
      toast.error("Please login to like this video ❤️");
      router.push("/login"); // 👈 redirect to login page
      return;
    }

    const isLiked = likedVideos.has(uniqueId);

    if (isLiked) {
      await supabase
        .from("video_likes")
        .delete()
        .eq("video_unique_id", uniqueId)
        .eq("user_id", user.id);

      setLikedVideos((prev) => {
        const newSet = new Set(prev);
        newSet.delete(uniqueId);
        return newSet;
      });

      setLikeCounts((prev) => ({ ...prev, [uniqueId]: (prev[uniqueId] || 0) - 1 }));
    } else {
      await supabase.from("video_likes").insert({
        video_unique_id: uniqueId,
        user_id: user.id,
      });

      setLikedVideos((prev) => new Set(prev).add(uniqueId));
      setLikeCounts((prev) => ({ ...prev, [uniqueId]: (prev[uniqueId] || 0) + 1 }));
    }
  };


  const handleComment = (uniqueId: string) => {
    setCommentModal({ open: true, videoId: uniqueId });
  };

  useEffect(() => {
    if (!videoId || videos.length === 0) return;

    const index = videos.findIndex((v) => v.uniqueId === videoId);

    if (index !== -1) {
      setActiveIndex(index);

      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: index * scrollRef.current.clientHeight,
            behavior: "smooth",
          });
        }
      }, 300);
    }
  }, [videoId, videos]);

  const submitComment = async () => {
    if (!newComment.trim() || !commentModal.videoId) return;

    // If not logged in → guest should enter name + phone
    if (!user) {
      if (!guestName.trim() || !guestPhone.trim()) {
        toast.error("Please enter your Name and Phone Number.");
        return;
      }
    }

    const { error } = await supabase.from("video_comments").insert({
      video_unique_id: commentModal.videoId,
      user_id: user ? user.id : null,
      comment: newComment.trim(),
      guest_name: user ? null : guestName.trim(),
      guest_phone: user ? null : guestPhone.trim(),
    });

    if (error) {
      toast.error("Failed to post comment!");
      console.log(error);
      return;
    }

    toast.success("Comment added!");
    setNewComment("");
    setGuestName("");
    setGuestPhone("");
    setCommentModal({ open: false, videoId: null });

    await fetchLikesAndComments(videos);
  };


  const handleService = (video: any) => {
    if (!user) {
      toast.error("Please login to access services 📋");
      router.push("/login");
      return;
    }
    router.push(`/user/videoview?vendorId=${video.vendorId}&tab=services`);
  };

  const handleAds = (video: any) => {
    if (!user) {
      toast.error("Please login to access ads 📢");
      router.push("/login");
      return;
    }
    router.push(`/user/videoview?vendorId=${video.vendorId}&tab=ads`);
  };


  const handleWebsite = (video: any) => {
    if (!user) {
      toast.error("Please login to access this feature 🌐");
      router.push("/login");
      return;
    }
    if (video.websites?.length) {
      window.open(video.websites[0], "_blank");
    } else {
      toast.error("No website available");
    }
  };



  const handlePhone = (video: any) => {
    if (video.mobile_number) {
      window.open(`tel:${video.mobile_number}`, "_self");
    } else {
      toast.error("No phone number available");
    }
  };

  const handleWhatsApp = (video: any) => {
    if (!video.mobile_number) {
      toast.error("Vendor WhatsApp number not available");
      return;
    }

    let phone = video.mobile_number.replace(/\D/g, ""); // remove +, spaces, -

    // If vendor already saved with country code
    if (phone.startsWith("91") && phone.length === 12) {
      // ok
    }
    // If vendor saved only 10 digits
    else if (phone.length === 10) {
      phone = "91" + phone;
    }
    else {
      toast.error("Invalid vendor number format");
      return;
    }

    window.open(`https://wa.me/${phone}`, "_blank");
  };
  useEffect(() => {
    const activeVideoEl = videoRefs.current[activeIndex];

    if (activeVideoEl) {
      activeVideoEl.muted = !soundOn;

      activeVideoEl.play().catch(() => {
        console.log("Autoplay blocked by browser");
      });
    }
  }, [soundOn, activeIndex]);
  useEffect(() => {
    videoRefs.current.forEach((vid, i) => {
      if (vid && i !== activeIndex) {
        vid.pause();
        vid.currentTime = 0;
      }
    });
  }, [activeIndex]);


  // --- MOBILE VIEW ---
  if (isMobile && !loading) {
    const activeVideo = filteredVideos[activeIndex];

    return (
      <div className="h-[100dvh] w-full bg-black overflow-hidden relative">
        <Toaster position="top-center" />

        {/* SEARCH + FILTER */}
        <div className="fixed inset-0 z-[150] pointer-events-none">
          <div className="absolute top-24 left-0 right-0 px-4 pointer-events-auto space-y-2">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-2 p-3 shadow-2xl">
              <Search className="text-yellow-400 ml-1" size={16} />
              <input
                type="text"
                placeholder="SEARCH VIDEOS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent w-full text-white text-[10px] font-black tracking-widest outline-none placeholder:text-white/40 uppercase"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-1/2 bg-black/40 backdrop-blur-xl border border-white/10 text-white text-[9px] font-black uppercase tracking-tighter p-2.5 rounded-xl outline-none"
              >
                {sectors.map((s) => (
                  <option key={s} value={s} className="bg-gray-900">
                    {s}
                  </option>
                ))}
              </select>

              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-1/2 bg-black/40 backdrop-blur-xl border border-white/10 text-white text-[9px] font-black uppercase tracking-tighter p-2.5 rounded-xl outline-none"
              >
                {areas.map((a) => (
                  <option key={a} value={a} className="bg-gray-900">
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* RIGHT ICON PANEL (ONLY ACTIVE VIDEO) */}
          {activeVideo && (
            <div className="fixed right-4 bottom-28 z-[160] flex flex-col gap-4 pointer-events-auto">
              {/* SOUND TOGGLE */}
              <button
                onClick={() => setSoundOn((prev) => !prev)}
                className="flex flex-col items-center gap-1"
              >
                <div className="p-3 rounded-full bg-black/50 backdrop-blur-xl border border-white/20">
                  <span className="text-white text-[20px]">
                    {soundOn ? "🔊" : "🔇"}
                  </span>
                </div>

                <span className="text-[9px] font-bold text-white uppercase">
                  {soundOn ? "Sound" : "Mute"}
                </span>
              </button>

              {/* LIKE */}
              <button
                onClick={() => toggleLike(activeVideo.uniqueId)}
                className="flex flex-col items-center gap-1"
              >
                <div className="p-3 rounded-full bg-black/50 backdrop-blur-xl border border-white/20">
                  <FontAwesomeIcon
                    icon={faHandsClapping}
                    className={likedVideos.has(activeVideo.uniqueId) ? "text-yellow-400" : "text-white"}
                    style={{ fontSize: "24px" }}
                  />
                </div>

                <span className="text-[10px] font-bold text-white">
                  {likeCounts[activeVideo.uniqueId] || 0}
                </span>
              </button>


              {/* COMMENT */}
              <button
                onClick={() => handleComment(activeVideo.uniqueId)}
                className="flex flex-col items-center gap-1"
              >
                <div className="p-3 rounded-full bg-black/50 backdrop-blur-xl border border-white/20">
                  <MessageSquare size={24} className="text-white" />
                </div>
                <span className="text-[10px] font-bold text-white">
                  {commentCounts[activeVideo.uniqueId] || 0}
                </span>
              </button>

              <button
                onClick={() => handleShare(activeVideo)}
                className="flex flex-col items-center gap-1"
              >
                <div className="p-3 rounded-full bg-black/50 backdrop-blur-xl border border-white/20">
                  <Share2 size={24} className="text-white" />
                </div>

                <span className="text-[9px] font-bold text-white uppercase">
                  Share
                </span>
              </button>

              {/* SHOW BELOW ONLY FOR REGISTER VIDEOS */}
              {activeVideo.source === "register" && (
                <>
                  {/* SERVICE */}
                  <button onClick={() => handleService(activeVideo)} className="flex flex-col items-center gap-1">
                    <div className="p-3 rounded-full bg-black/50 backdrop-blur-xl border border-white/20">
                      <Briefcase size={24} className="text-yellow-400" />
                    </div>
                    <span className="text-[9px] font-bold text-white uppercase">
                      Update
                    </span>
                  </button>

                  {/* WEBSITE */}
                  {activeVideo.websites?.length > 0 && (
                    <button
                      onClick={() => handleWebsite(activeVideo)}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className="p-3 rounded-full bg-black/50 backdrop-blur-xl border border-white/20">
                        <Globe size={24} className="text-blue-400" />
                      </div>
                      <span className="text-[9px] font-bold text-white uppercase">
                        Site
                      </span>
                    </button>
                  )}

                  {/* ADS */}
                  <button onClick={() => handleAds(activeVideo)} className="flex flex-col items-center gap-1">
                    <div className="p-3 rounded-full bg-black/50 backdrop-blur-xl border border-white/20">
                      <Megaphone size={24} className="text-pink-400" />
                    </div>
                    <span className="text-[9px] font-bold text-white uppercase">
                      Ads
                    </span>
                  </button>
                </>
              )}
            </div>
          )}

        </div>

        {/* VIDEO SCROLL */}
        <div
          ref={scrollRef}
          className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
          onScroll={(e) => {
            const container = e.target as HTMLDivElement;
            const scrollTop = container.scrollTop;
            const screenHeight = container.clientHeight;

            const index = Math.min(
              filteredVideos.length - 1,
              Math.max(0, Math.round(scrollTop / screenHeight))
            );

            setActiveIndex(index);
          }}

        >

          {filteredVideos.map((video, index) => (
            <div key={video.uniqueId} className="h-[100dvh] w-full snap-start relative bg-black">

              {/* VIDEO */}
              <div className="absolute inset-0 z-0">
                {video.isYouTube ? (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <iframe
                      key={`${video.uniqueId}-${activeIndex}-${soundOn}`}
                      src={`https://www.youtube.com/embed/${video.ytId}?autoplay=${activeIndex === index ? 1 : 0
                        }&mute=${activeIndex === index ? (soundOn ? 0 : 1) : 1
                        }&loop=1&playlist=${video.ytId}&controls=1&modestbranding=1&rel=0&playsinline=1`}
                      className="w-full h-full scale-[1.7]"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />

                  </div>
                ) : (
                  <video
                    ref={(el) => {
                      videoRefs.current[index] = el;
                    }}
                    key={video.uniqueId}
                    src={video.url}
                    autoPlay={activeIndex === index}
                    muted={activeIndex === index ? !soundOn : true}
                    loop
                    playsInline
                    controls={activeIndex === index}
                    className="w-full h-full object-cover"
                  />



                )}


              </div>

              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 z-10 pointer-events-none" />

              {/* CONTENT */}
              <div className="absolute bottom-40 left-6 right-20 z-[160] pointer-events-none">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-red-600 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-white">
                    {video.sector}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-400 uppercase">
                    <MapPin size={10} /> {video.area}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 w-full mb-6">
                  {/* Video Title - Truncated to stay on one line */}
                  <h3 className="text-lg font-black text-white uppercase truncate drop-shadow-xl flex-1">
                    {video.title}
                  </h3>

                  {/* Stats Group */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* View Count Badge */}
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-sm transition-all hover:bg-white/20">
                      <Eye size={12} className="text-white/80" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-white">
                        {Intl.NumberFormat('en-US', { notation: 'compact' }).format(viewCounts[video.uniqueId] || 0)}
                        <span className="ml-1 text-white/50">Views</span>
                      </span>
                    </div>

                    {/* Trending Badge */}
                    {viewCounts[video.uniqueId] > 1000 && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 border border-red-500/40 rounded-lg animate-in fade-in zoom-in duration-300">
                        <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-[8px] font-black uppercase text-red-400">Hot</span>
                      </div>
                    )}
                  </div>
                </div>
                {video.vendorId && (
                  <div className="flex items-center gap-3 pointer-events-auto relative z-[200]">
                    {/* VIEW PROFILE */}
                    <Link
                      href={`/vendor/view/${video.vendorId}`}
                      className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-black px-8 py-4 rounded-2xl text-[12px] font-black shadow-[0_15px_30px_rgba(250,204,21,0.4)] active:scale-95 transition-transform uppercase tracking-widest"
                    >
                      <User size={18} /> VIEW PROFILE
                    </Link>

                    {/* CALL BUTTON */}
                    {video.mobile_number && (
                      <button
                        onClick={() => handlePhone(video)}
                        className="p-4 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20 active:scale-95 transition-transform"
                      >
                        <Phone size={20} className="text-green-400" />
                      </button>
                    )}

                    {/* WHATSAPP BUTTON */}
                    {video.mobile_number && (
                      <button
                        onClick={() => handleWhatsApp(video)}
                        className="p-4 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20 active:scale-95 transition-transform"
                      >
                        <MessageCircle size={20} className="text-green-500" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>


        {/* COMMENT MODAL */}
        <AnimatePresence>
          {commentModal.open && (
            <motion.div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
              >
                {/* Header - Fixed */}
                <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-xl">
                      <MessageSquare className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none">
                        Comment
                      </h3>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">
                        {(comments[commentModal.videoId!] || []).length} Thoughts shared
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCommentModal({ open: false, videoId: null })}
                    className="p-2 hover:bg-slate-200/50 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Comments List - Scrollable */}
                <div className="p-8 space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar bg-white">
                  {comments[commentModal.videoId!]?.length > 0 ? (
                    (comments[commentModal.videoId!] || []).map((c, i) => (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={i}
                        className="group flex gap-4"
                      >
                        {/* Avatar Placeholder */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs border border-slate-200">
                          {c.guest_name ? c.guest_name.charAt(0).toUpperCase() : <User size={16} />}
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-700">
                              {c.guest_name || "Member"}
                            </span>
                            {c.guest_phone && (
                              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md">
                                <Phone size={10} /> {c.guest_phone}
                              </span>
                            )}
                          </div>
                          <div className="bg-slate-50 group-hover:bg-blue-50/50 p-4 rounded-2xl rounded-tl-none border border-slate-100 transition-colors">
                            <p className="text-slate-600 text-sm leading-relaxed">
                              {c.comment}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 opacity-40">
                      <Smile size={48} className="mb-4 text-slate-300" />
                      <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">
                        No comments yet
                      </p>
                    </div>
                  )}
                </div>

                {/* Input Section - Fixed at bottom */}
                <div className="p-8 bg-slate-50/80 border-t border-slate-100 backdrop-blur-md">
                  <div className="space-y-3">
                    {!user && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <User className="absolute left-3 top-3 text-slate-300" size={16} />
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 transition-all"
                          />
                        </div>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 text-slate-300" size={16} />
                          <input
                            type="text"
                            placeholder="Phone"
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 transition-all"
                          />
                        </div>
                      </div>
                    )}

                    <div className="relative">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your Comment..."
                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all resize-none"
                        rows={2}
                      />
                      <button
                        onClick={submitComment}
                        disabled={!newComment.trim()}
                        className="absolute right-3 bottom-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-blue-200 disabled:shadow-none active:scale-95"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // --- DESKTOP VIEW ---
  return (
    <div className="min-h-screen bg-[#FFFDF5] text-gray-900 pb-20 font-sans">
      <Toaster position="top-right" />

      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-12 pb-20 px-6 border-b border-yellow-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
              Video <span className="text-red-600 ">Hub</span>
            </h1>
          </div>
          <MonitorPlay size={50} className="text-yellow-600 hidden md:block opacity-40" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        {/* Filters */}
        <div className="bg-white p-3 rounded-2xl shadow-xl border border-yellow-100 mb-10">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-600" size={18} />
              <input
                type="text"
                placeholder="SEARCH TUTORIALS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-yellow-50/50 rounded-xl outline-none font-bold text-xs uppercase"
              />
            </div>

            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-yellow-50/50 px-4 py-3 rounded-xl text-[10px] font-black uppercase border-none cursor-pointer"
            >
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="bg-yellow-50/50 px-4 py-3 rounded-xl text-[10px] font-black uppercase border-none cursor-pointer"
            >
              {areas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
          {filteredVideos.map((video, index) => (
            <motion.div
              key={video.uniqueId}
              className="group bg-white rounded-[2.5rem] border border-yellow-100 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-xl transition-all duration-300"
            >
              {/* VIDEO CONTAINER */}
              <div className="relative h-60 w-full overflow-hidden cursor-pointer" onClick={() => setSelectedVideo(video)}>
                {video.isYouTube ? (
                  activeIndex === index ? (
                    <iframe
                      key={video.uniqueId}
                      src={`https://www.youtube.com/embed/${video.ytId}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0&playsinline=1`}
                      className="w-full h-full scale-[1.2]"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                      <p className="text-white text-sm font-bold opacity-50">Loading...</p>
                    </div>
                  )
                ) : (
                  <video
                    src={video.url}
                    autoPlay={activeIndex === index}
                    muted={false}
                    loop
                    playsInline
                    controls
                    className="w-full h-full object-cover"
                  />
                )}



                {/* FLOATING TOP ACTIONS (Like & Comment) */}
                <div className="absolute top-4 right-4 flex flex-col gap-3 z-30">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLike(video.uniqueId); }}
                    className="p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white hover:bg-white hover:text-red-500 transition-all shadow-lg group/icon"
                  >
                    <FontAwesomeIcon
                      icon={faHandsClapping}
                      style={{ fontSize: "20px" }}
                      className="group-active/icon:scale-125 transition-transform"
                    />
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); setCommentModal({ open: true, videoId: video.uniqueId }) }}
                    className="p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white hover:bg-white hover:text-blue-500 transition-all shadow-lg"
                  >
                    <MessageSquare size={20} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(video);
                    }}
                    className="p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white hover:bg-white hover:text-green-500 transition-all shadow-lg"
                  >
                    <Share2 size={20} />
                  </button>
                </div>

                {/* PLAY OVERLAY */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <Play size={48} className="text-white fill-current" />
                </div>
              </div>

              {/* CONTENT SECTION */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{video.sector}</span>
                </div>

                <h3 className="text-xl font-black mt-1 line-clamp-1 text-gray-900">{video.title}</h3>

                <div className="mt-6 pt-6 border-t border-gray-100/60">

                  {/* AREA & NAVIGATION */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 rounded-full border border-yellow-100 shadow-sm">
                      <MapPin size={14} className="text-yellow-600 animate-pulse" />
                      <span className="text-xs font-bold text-yellow-800 uppercase tracking-tight">
                        {video.area}
                      </span>
                    </div>

                    {video.vendorId && (
                      <Link
                        href={`/vendor/view/${video.vendorId}`}
                        className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <ChevronRight size={20} />
                      </Link>
                    )}
                  </div>

                  {/* UNIFIED ACTION GRID (Same Background Style) */}
                  {video.source === "register" && (
                    <div className="flex items-center justify-between gap-2 p-1.5 bg-gray-100/50 rounded-2xl">

                      <button
                        onClick={() => handleService(video)}
                        className="flex-1 flex items-center justify-center py-3 rounded-xl bg-white border border-gray-100 text-gray-600 hover:text-green-600 hover:shadow-sm transition-all active:scale-95"
                      >
                        <Briefcase size={18} />
                      </button>

                      <button
                        onClick={() => handleAds(video)}
                        className="flex-1 flex items-center justify-center py-3 rounded-xl bg-white border border-gray-100 text-gray-600 hover:text-pink-600 hover:shadow-sm transition-all active:scale-95"
                      >
                        <Megaphone size={18} />
                      </button>

                      {video.websites?.length > 0 && (
                        <button
                          onClick={() => handleWebsite(video)}
                          className="flex-1 flex items-center justify-center py-3 rounded-xl bg-white border border-gray-100 text-gray-600 hover:text-purple-600 hover:shadow-sm transition-all active:scale-95"
                        >
                          <Globe size={18} />
                        </button>
                      )}



                      {video.mobile_number && (
                        <>
                          <button
                            onClick={() => handlePhone(video)}
                            className="flex-1 flex items-center justify-center py-3 rounded-xl bg-white border border-gray-100 text-gray-600 hover:text-blue-600 hover:shadow-sm transition-all active:scale-95"
                          >
                            <Phone size={18} />
                          </button>

                          <button
                            onClick={() => handleWhatsApp(video)}
                            className="flex-1 flex items-center justify-center py-3 rounded-xl bg-white border border-gray-100 text-gray-600 hover:text-green-500 hover:shadow-sm transition-all active:scale-95"
                          >
                            <MessageCircle size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div className="w-full max-w-4xl bg-white rounded-[2rem] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="aspect-video w-full bg-black">
                {selectedVideo.isYouTube ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.ytId}?autoplay=1`} className="w-full h-full" allowFullScreen allow="autoplay" />
                ) : (
                  <video src={selectedVideo.url} controls autoPlay className="w-full h-full" />
                )}
              </div>

              <div className="p-6 flex justify-between items-center">
                <h2 className="text-xl font-black uppercase">{selectedVideo.title}</h2>
                <button onClick={() => setSelectedVideo(null)} className="bg-gray-100 text-gray-500 px-5 py-2 rounded-xl text-xs font-black">
                  CLOSE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}