import React from "react";
import { useAlbum } from "../hooks/useAlbum";
import { useLocation, useNavigate } from "react-router";
import "./Album.css";
import Opensea from "../images/opensea.png";
import { useIPFS } from "../hooks/useIPFS";
import { ClockCircleOutlined } from "@ant-design/icons";

const Album = ({ setNftAlbum, setIndex }) => {
  const { state: album } = useLocation();
  const navigate = useNavigate();
  const { resolveLink } = useIPFS();
  //const { album } = useAlbum(albumDetails.contract); // album is straight from firebase
  // for the setNftAlbum, probably use album.tracklist array? yes indeed
  return (
    <>
      <div className="albumContent">
        <div className="topBan">
          <img
            src={resolveLink(album.image)}
            alt="albumcover"
            className="albumCover"
          ></img>
          <div className="albumDeets">
            <div>{album.type.toUpperCase()}</div>
            <div className="title">{album.title}</div>
            <div className="artist">{album && album.tracks[0].artist}</div>
            <div>
              {album && album.tracks[0].year} • {album && album.tracks.length}{" "}
              Songs
            </div>
          </div>
        </div>
        <div className="topBan">
          <div
            className="playButton"
            onClick={() => {
              setNftAlbum(album.tracks);
              setIndex(0);
            }}
          >
            PLAY
          </div>
          <div
            className="openButton"
            onClick={() =>
              window.open(`https://testnets.opensea.io/collection/demusetoken`)
            }
          >
            OpenSea
            <img src={Opensea} className="openLogo" />
          </div>
          <div className="openButton" onClick={() => navigate("/")}>
            Go Home
          </div>
        </div>
        <div className="tableHeader">
          <div className="numberHeader">#</div>
          <div className="titleHeader">TITLE</div>
          <div className="numberHeader">
            <ClockCircleOutlined />
          </div>
        </div>
        {album &&
          album.tracks.map((track, i) => {
            return (
              <>
                <div
                  className="tableContent"
                  onClick={() => {
                    setNftAlbum(album.tracks);
                    setIndex(i);
                  }}
                >
                  <div className="numberHeader">{i + 1}</div>
                  <div
                    className="titleHeader"
                    style={{ color: "rgb(205, 203, 203)" }}
                  >
                    {track.name}
                  </div>
                  <div className="numberHeader">{track.duration}</div>
                </div>
              </>
            );
          })}
      </div>
    </>
  );
};

export default Album;
