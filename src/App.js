import { useEffect, useState } from 'react';
import {
  urlClient,
  LENS_HUB_CONTRACT_ADDRESS,
  queryRecommendedProfiles,
  queryExplorePublications
} from './queries';

import LENSHUB from './lenshub';
import { ethers } from 'ethers';
import { Box, Button, Image } from '@chakra-ui/react';

import defaultAvatar from './default-avatar.png';
import followIcon from './follow-icon.png';

import {
  chakra,
  Container,
  Stack,
  Text,
  useColorModeValue,
  VisuallyHidden,
} from '@chakra-ui/react';
import { FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa';
import { ReactNode } from 'react';

function App() {
  const [account, setAccount] = useState(null);
  const [profiles, setProfiles] = useState([]);
  console.log("🚀 ~ file: App.js ~ line 16 ~ App ~ profiles", profiles) //log the returned data
  const [posts, setPosts] = useState([]);
  console.log("🚀 ~ file: App.js ~ line 18 ~ App ~ posts", posts) //log returned data

  //No.(1) Function
  async function signIn() {
    //connect to metamask
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });
    setAccount(accounts[0]);
  }

  //No.(2) Function
  async function getRecommendedProfiles() {
    const response = await urlClient.query(queryRecommendedProfiles).toPromise();
    const profiles = response.data.recommendedProfiles.slice(0, 5);
    setProfiles(profiles);
  }

  //No.(3) Function
  async function getPosts() {
    const response = await urlClient.query(queryExplorePublications).toPromise();
    const posts = response.data.explorePublications.items.filter((post) => {
      if (post.profile) return post;
      return "";
    });
    setPosts(posts);
  }

  //No.(4) Function
  async function follow(id) {
    //call the blockchain + signing
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(
      LENS_HUB_CONTRACT_ADDRESS,
      LENSHUB,
      provider.getSigner()
    );
    //ensure the id that passed in is an integer and set a default [0x0] 
    const tx = await contract.follow([parseInt(id)], [0x0]);
    await tx.wait();
  }

  //call the functons when the page loads
  useEffect(() => {
    getRecommendedProfiles();
    getPosts();
  }, [])

  //function to get image from ipfs
  const parseImageUrl = (profile) => {
    if (profile) {
      const url = profile.picture?.original?.url;
      if (url && url.startsWith("ipfs:")) {
        const ipfsHash = url.split("//")[1];
        return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      }
      return url;
    }
    return { defaultAvatar };
  }

  //footer function
  const SocialButton = ({
    children,
    label,
    href,
  }: {
    children: ReactNode;
    label: string;
    href: string;
  }) => {
    return (
      <chakra.button
        bg={useColorModeValue('blackAlpha.100', 'whiteAlpha.100')}
        rounded={'full'}
        w={8}
        h={8}
        cursor={'pointer'}
        as={'a'}
        href={href}
        display={'inline-flex'}
        alignItems={'center'}
        justifyContent={'center'}
        transition={'background 0.3s ease'}
        _hover={{
          bg: useColorModeValue('blackAlpha.200', 'whiteAlpha.200'),
        }}>
        <VisuallyHidden>{label}</VisuallyHidden>
        {children}
      </chakra.button>
    );
  };


  return (
    <div className="app">
    {/* rgba(5 , 32 , 64 , 28) */}
      <Box width="100%" backgroundColor="#150050">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="55%"
          margin="auto"
          color="white"
          padding="10px 0"
        >
          <Box>
            <Box fontFamily="DM Serif Display" fontSize="44px" fontStyle="italic">
              LET'S CONNECT
            </Box>
            <Box>Modernize We Interact In Decentralized Way</Box>
          </Box>
          {account ? (
            <Box backgroundColor="#000" padding="15px" boderRadius="6px">
              Connected
            </Box>
          ) : (
            <Button
              onClick={signIn}
              // color="rgba(5,32,64)"
              color="#150050"
              _hover={{ backgroundColor: "#808080" }}
            >
              Connect
            </Button>
          )}
        </Box>
      </Box>

      {/* CONTENT */}
      <Box
        display="flex"
        justifyContent="space-between"
        width="55%"
        margin="35px auto auto auto"
        color="white"
      >
        {/* POSTS */}
        <Box width="65%" maxWidth="65%" minWidth="65%">
          {posts.map((post) => (
            <Box
              key={post.id}
              marginBottom="25px"
              // backgroundColor="rgba(5,32,64,28)"
              backgroundColor="#3F0071"
              padding="40px 30px 40px 25px"
              borderRadius="6px"
            >
              <Box display="flex">
                { /* PROFILE IMAGE */}
                <Box width="75px" height="75px" marginTop="8px">
                  <img
                    alt="profile"
                    src={parseImageUrl(post.profile)}
                    width="75px"
                    height="75px"
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null; //prevents looping
                      currentTarget.src = { defaultAvatar };
                    }}
                  />
                </Box>

                {/*POST CONTENT */}
                <Box flexGrow={1} marginLeft="20px">
                  <Box display="flex" justifyContent="space-between">
                    <Box fontFamily="DM Serif Display" fontSize="24px">
                      {/* handle user to create the post */}
                      {post.profile?.handle}
                    </Box>
                    <Box height="50px" _hover={{ cursor: "pointer" }}>
                      <Image
                        alt="follow-icon"
                        src={followIcon}
                        width="50px"
                        height="50px"
                        onClick={() => follow(post.id)}
                      />
                    </Box>
                  </Box>
                  <Box overflowWrap="anywhere" fontSize="14px">
                    {post.metadata?.content}
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {/* FRIEND SUGGESTION */}
        <Box width="30%" 
          // backgroundColor="rgba(5,32,64,28)"
          backgroundColor="#3F0071"
          padding="40px 25px"
          borderRadius="6px"
          height="fit-content"
        >
          <Box fontFamily="DM Serif Display" as='b'>FRIEND SUGGESTIONS</Box>
          <Box>
            {profiles.map((profile, i) => (
              <Box
                key={profile.id}
                margin="30px 0"
                display="flex"
                alignItems="center"
                height="40px"
                _hover={{ color: "#808080", cursor: "pointer" }}
              >
                <img
                  alt="profile"
                  src={parseImageUrl(profile)}
                  width="75px"
                  height="75px"
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null; //prevents looping
                    currentTarget.src = { defaultAvatar };
                  }}
                />
                <Box marginLeft="25px">
                  <h4>{profile.name}</h4>
                  <p>{profile.handle}</p>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* FOOTER SECTION */}
      <Box
        bg={useColorModeValue('gray.50', 'gray.900')}
        color={useColorModeValue('gray.700', 'gray.200')}>
        <Container
          as={Stack}
          maxW={'6xl'}
          py={4}
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          justify={{ base: 'center', md: 'space-between' }}
          align={{ base: 'center', md: 'center' }}>
          <Text>© 2022 SamKoh. All rights reserved</Text>
          <Stack direction={'row'} spacing={6}>
            <SocialButton label={'Twitter'} href={'https://twitter.com/home'} target='_blank'>
              <FaTwitter />
            </SocialButton>
            <SocialButton label={'Github'} href={'https://github.com/samkoh'} target="_blank">
              <FaGithub />
            </SocialButton>
            <SocialButton label={'LinkedIn'} href={'https://www.linkedin.com/in/samkoha81718123/'} target="_blank">
              <FaLinkedin />
            </SocialButton>
          </Stack>
        </Container>
      </Box>


    </div>
  );
}

export default App;
