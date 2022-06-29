import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  client,
  recommendProfiles,
  getPublications,
  searchProfiles,
} from "../api";
import lens from "./lens.png";

export default function Home() {
  const [profiles, setProfiles] = useState([]);
  const [searchString, setSearchString] = useState("");

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    try {
      const response = await client.query(recommendProfiles).toPromise();
      const profileData = await Promise.all(
        response.data.recommendedProfiles.map(async (profile) => {
          const pub = await client
            .query(getPublications, { id: profile.id, limit: 1 })
            .toPromise();
          profile.publication = pub.data.publications.items[0];
          return profile;
        })
      );
      setProfiles(profileData);
    } catch (err) {
      console.log("error fetching recommended profiles: ", err);
    }
  }

  async function searchForProfile() {
    try {
      const response = await client
        .query(searchProfiles, {
          query: searchString,
          type: "PROFILE",
        })
        .toPromise();
      const profileData = await Promise.all(
        response.data.search.items.map(async (profile) => {
          const pub = await client
            .query(getPublications, { id: profile.profileId, limit: 1 })
            .toPromise();
          profile.id = profile.profileId;
          profile.publication = pub.data.publications.items[0];
          return profile;
        })
      );

      setProfiles(profileData);
    } catch (err) {
      console.log("error searching profiles...", err);
    }
  }

  console.log({ profiles });

  return (
    <div style={{ padding: "2px" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Image src={lens} alt="imag" />
      </div>
      <input
        placeholder="Search"
        onChange={(e) => setSearchString(e.target.value)}
        value={searchString}
      />
      <button style={{ margin: "15px" }} onClick={searchForProfile}>
        SEARCH PROFILES
      </button>
      <button style={{ margin: "15px" }} onClick={fetchProfiles}>
        SHOW ALL PROFILES
      </button>
      {profiles && (
        <div style={{ padding: "20px", borderTop: "1px solid #ededed" }}>
          {profiles.map((profile, index) => (
            <Link href={`/profile/${profile.id}`} key={index}>
              <a>
                {profile.picture?.original ? (
                  <Image
                    src={profile.picture?.original?.url}
                    width="52px"
                    height="52px"
                    alt="imag"
                  />
                ) : (
                  <div style={blankPhotoStyle} />
                )}
                <p>
                  <b>{profile.handle}</b>{" "}
                </p>
                <p> {profile.publication?.metadata.content}</p>
              </a>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const blankPhotoStyle = {
  width: "52px",
  height: "52px",
  backgroundColor: "black",
};
