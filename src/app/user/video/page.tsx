"use client";

import { PlayCircle, X } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function VideoPage() {
    const [selectedVideo, setSelectedVideo] = useState(null);

    const videos = [
        {
            id: 1,
            title: "How to Maintain Your AC Like a Pro",
            thumbnail: "/thumbnails/ac.mp4",
            duration: "4:32",
        },
        {
            id: 2,
            title: "Car Deep Cleaning – Full Process",
            thumbnail: "/thumbnails/car.mp4",
            duration: "7:21",
        },
        {
            id: 3,
            title: "How to Clean Sofa at Home Easily",
            thumbnail: "/thumbnails/sofa.mp4",
            duration: "3:40",
        },
    ];

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* HEADER */}
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-12 shadow-lg rounded-b-3xl flex flex-col items-center justify-center text-center">
                <h1 className="text-5xl font-extrabold text-white tracking-wide drop-shadow-lg mb-4">
                    Watch Videos
                </h1>
                <p className="text-white/90 text-xl max-w-md">
                    Learn useful tips, tutorials & service guides.
                </p>
            </div>

            {/* HEADING */}
            <h2 className="text-2xl font-bold text-gray-900 px-6 mt-8 mb-4">
                Featured Videos
            </h2>

            {/* VIDEO GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-6">
                {videos.map((video, index) => (
                    <motion.div
                        key={video.id}
                        initial={{ x: -100, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{
                            duration: 0.6,
                            delay: index * 0.15,
                            ease: "easeOut",
                        }}
                        viewport={{ once: true }}
                        onClick={() => setSelectedVideo(video)}
                        className="rounded-3xl bg-white shadow-lg border border-yellow-200 hover:shadow-2xl 
                        transition-all duration-300 overflow-hidden cursor-pointer group"
                    >
                        {/* THUMBNAIL */}
                        <div className="relative h-60 overflow-hidden">
                            <video
                                src={video.thumbnail}
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                muted
                                autoPlay
                                loop
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                <PlayCircle size={75} className="text-white drop-shadow-2xl" />
                            </div>

                            {/* Duration */}
                            <span className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-3 py-1 rounded-full">
                                {video.duration}
                            </span>
                        </div>

                        {/* Text */}
                        <div className="p-5">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-yellow-600 transition">
                                {video.title}
                            </h3>
                            <p className="text-gray-500 text-sm mt-1">Tap to watch →</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* MINI VIDEO POPUP SCREEN */}
            <AnimatePresence>
                {selectedVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999]"
                        onClick={() => setSelectedVideo(null)} // Close on backdrop click
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            className="bg-white rounded-3xl shadow-2xl p-4 max-w-xl w-[90%] relative"
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
                        >
                            {/* CLOSE BUTTON */}
                            <button
                                className="absolute top-3 right-3 bg-black/80 text-white p-2 rounded-full hover:bg-black transition-colors duration-200 z-10"
                                onClick={() => setSelectedVideo(null)}
                            >
                                <X size={20} />
                            </button>

                            {/* VIDEO PLAYER */}
                            <video
                                src={selectedVideo.thumbnail}
                                controls
                                autoPlay
                                className="w-full rounded-2xl"
                            />

                            <h3 className="mt-4 text-lg font-bold text-gray-800">
                                {selectedVideo.title}
                            </h3>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}