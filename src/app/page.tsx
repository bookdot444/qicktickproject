"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/user");
    }, 1000); // 1 sec loading

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "6px solid #f3f3f3",
    borderTop: "6px solid #000000",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};