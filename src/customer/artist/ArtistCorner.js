import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./ArtistCorner.css";
import { Tabs, Button, Spin, Modal } from "antd";
import Settings from "../Settings";
import MusicUpload from "./MusicUpload";
import MusicMint from "./MusicMint";
import MakeAlbum from "./MakePlaylist";
const { TabPane } = Tabs;

// image loading from ipfs is sooooo slow fr
const ArtistCorner = () => {
  return (
    <>
      <Tabs defaultActiveKey="1" centered>
        <TabPane tab="MUSIC UPLOAD" key="1">
          <MusicUpload />
        </TabPane>
        <TabPane tab="MUSIC MINT" key="2">
          <MusicMint />
        </TabPane>
        <TabPane tab="MAKE PLAYLIST" key="3">
          <MakeAlbum />
        </TabPane>
        <TabPane tab="SETTINGS" key="4">
          <Settings />
        </TabPane>
      </Tabs>
    </>
  );
};

export default ArtistCorner;
