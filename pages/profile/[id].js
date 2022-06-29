import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import Image from "next/image";
import { client, getPublications, getProfiles, getProfil } from "../../api";
import ABI from "../../abi.json";
import Link from "next/link";

const CONTRACT_ADDRESS = "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d";

export default function Profile() {
  const [profile, setProfile] = useState();
  const [publications, setPublications] = useState([]);
  const [account, setAccount] = useState("");
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchProfile();
    }
  }, [id]);

  async function fetchProfile() {
    try {
      const returnedProfile = await client.query(getProfil, { id }).toPromise();
      const profileData = returnedProfile.data.profile;
      setProfile(profileData);

      const pubs = await client
        .query(getPublications, { id, limit: 50 })
        .toPromise();

      setPublications(pubs.data.publications.items);
    } catch (err) {
      console.log("error fetching profile...", err);
    }
  }

  async function connectWallet() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    console.log("accounts: ", accounts);
    accounts[0];
    setAccount(account);
  }

  function getSigner() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return provider.getSigner();
  }

  async function followUser() {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, getSigner());

    try {
      const tx = await contract.follow([id], [0x0]);
      await tx.wait();
      console.log(`successfully followed ... ${profile.handle}`);
    } catch (err) {
      console.log("error: ", err);
    }
  }

  if (!profile) return null;

  return (
    <div>
      <div style={profileContainerStyle}>
        <button style={{ margin: "15px" }} onClick={connectWallet}>
          Sign In
        </button>

        <div style={profileImageStyle}>
          <Image
            width="200px"
            height="200px"
            src={profile.picture?.original?.url}
            alt="user"
          />
        </div>
        <h2>{profile.handle}</h2>
        <p>
          * Total followers: <b>{profile.stats.totalFollowers}</b>
        </p>
        <p>
          * Total following: <b>{profile.stats.totalFollowing}</b>
        </p>
        <p>
          * Total posts: <b>{profile.stats.totalPosts}</b>
        </p>
        <h3>Content:</h3>
        <div>
          {publications.map((pub, index) => (
            <div
              style={{ padding: "20px", borderTop: "1px solid #ededed" }}
              key={index}
            >
              <p>- {pub.metadata.content}</p>
            </div>
          ))}
        </div>
        <button style={{ margin: "15px" }} onClick={followUser}>
          Follow User
        </button>
        <Link href={`/`}>
          <a>
            <button style={{ margin: "15px" }}>Back</button>
          </a>
        </Link>
      </div>
    </div>
  );
}

const profileContainerStyle = {
  paddingTop: "100px",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
};
const profileImageStyle = {
  flexDirection: "column",
  alignItems: "center",
  margin: "30px",
};
