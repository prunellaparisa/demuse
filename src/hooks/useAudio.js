import React, { useState, useEffect, useRef } from "react";
import { useIPFS } from "./useIPFS";
import { db, fieldValue } from "../utils/firebase";

const useAudio = (tracks, index, paymentAddresses, userData) => {
  const { resolveLink } = useIPFS();
  const [audio, setAudio] = useState(tracks);
  const [trackIndex, setTrackIndex] = useState(0);
  const [newSong, setNewSong] = useState(0);
  const [trackProgress, setTrackProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef(
    new Audio(resolveLink(audio[trackIndex].animation_url))
  );

  const intervalRef = useRef();
  const isReady = useRef(false);

  const { duration } = audioRef.current;

  const toPrevTrack = () => {
    if (trackIndex - 1 < 0) {
      setTrackIndex(audio.length - 1);
    } else {
      setTrackIndex(trackIndex - 1);
    }
  };

  const toNextTrack = () => {
    if (trackIndex < audio.length - 1) {
      setTrackIndex(trackIndex + 1);
    } else {
      setTrackIndex(0);
    }
  };

  useEffect(() => {
    toggle();
    setAudio(tracks);
    if (trackIndex === index) {
      setNewSong(newSong + 1);
    } else {
      setTrackIndex(index);
    }
  }, [tracks, index]); //tracks was url initially

  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play();
      startTimer();
    } else {
      clearInterval(intervalRef.current);
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      audioRef.current.pause();
      clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    audioRef.current.pause();
    audioRef.current = new Audio(resolveLink(audio[trackIndex].animation_url));
    audioRef.current.volume = volume;
    setTrackProgress(Math.round(audioRef.current.currentTime));
    if (isReady.current) {
      audioRef.current.play();
      setIsPlaying(true);
      startTimer();
    } else {
      isReady.current = true;
    }
  }, [trackIndex, newSong]);

  const toggle = () => setIsPlaying(!isPlaying);

  const startTimer = () => {
    let updateDBCount = 0;
    let threshold = 5;
    let seconds = 0; // seconds have to reach threshold number to count as one listening count
    clearInterval(intervalRef.current);
    //console.log("trackIndex: " + trackIndex);
    //console.log("paymentAddresses[trackIndex]: " + paymentAddresses[trackIndex]);
    //console.log("userData.username: " + userData.username);
    //console.log("userData.listeningLog: " + userData.listeningLog); // TODO how to constantly refresh .listeningLog
    //updateListeningLog();

    intervalRef.current = setInterval(() => {
      if (audioRef.current.ended) {
        toNextTrack();
      } else {
        setTrackProgress(Math.round(audioRef.current.currentTime));
        seconds++;
        if (seconds > threshold && updateDBCount === 0) {
          // record one listening count to the artist
          updateListeningLog();
          updateDBCount++;
        }
      }
    }, [1000]);
  };

  const updateListeningLog = async () => {
    let field = `listeningLog.${paymentAddresses[trackIndex]}`;
    if (userData.id === null) return;
    await db
      .collection("user")
      .doc(userData.id)
      .update({
        [field]: fieldValue.increment(1),
      })
      .then(console.log("updated listening log!"));
  };

  const onSearch = (value) => {
    clearInterval(intervalRef.current);
    audioRef.current.currentTime = value;
    setTrackProgress(audioRef.current.currentTime);
  };

  const onSearchEnd = () => {
    if (!isPlaying) {
      setIsPlaying(true);
    }
    startTimer();
  };

  const onVolume = (vol) => {
    setVolume(vol);
    audioRef.current.volume = vol;
  };

  return [
    isPlaying,
    duration,
    toggle,
    toNextTrack,
    toPrevTrack,
    trackProgress,
    onSearch,
    onSearchEnd,
    onVolume,
    trackIndex,
  ];
};

export default useAudio;
