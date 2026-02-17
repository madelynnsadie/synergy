"use client"

import { useEffect, useState } from "react";
import { FaArrowRight, FaCrown, FaPen, FaPenFancy } from "react-icons/fa";

import { validateDetails } from "./server/auth/auth";
import { Chat } from "./server/db/db";
import { getChats } from "./server/data/getChats";
import { handleChat } from "./server/data/chat";
import { makeHash } from "./server/db/hash";
import { FaNoteSticky } from "react-icons/fa6";
import { createAccount, getIsAdmin } from "./server/admin/admin";

export default function Home() {
  const [input, setInput] = useState<string>("");

  const [chats, setChats] = useState<{ [key: string]: Chat }>({});


  const [chat, setChat] = useState<string>("");

  const [inputDisabled, setInputDisabled] = useState<boolean>(false);

  const sendMessage = async () => {
    if (inputDisabled) return;

    setInputDisabled(true);

    const oldInput = input;

    setInput("...");

    const res = await handleChat({
      id: chats?.[chat]?.ID ?? "new",
      newMessage: oldInput
    }, username, key);

    const newChats = { ...chats };

    newChats[res.ID] = res;

    setChats(newChats);

    setChat(res.ID);

    setInputDisabled(false);

    setInput("");
  };

  const [key, setKey] = useState<string>("");

  // fetch and set chats once we have a key
  useEffect(() => {
    if (!key) return;

    (async () => {
      setChats(await getChats(username, key));
    })();
  }, [key]);

  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    if (!key) return;
    (async () => {
      setIsAdmin(await getIsAdmin(username, key));
    })();
  }, [key]);

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [status, setStatus] = useState<[boolean, string]>([false, "login"]);

  const [hasCheckedStorage, setHasCheckedStorage] = useState<boolean>(false);

  const [adminDialog, setAdminDialog] = useState<boolean>(false);

  // first load details restore
  useEffect(() => {
    (async () => {
      const resolve = () => {
        setHasCheckedStorage(true);
      };

      const username = localStorage.getItem("username");
      const password = localStorage.getItem("password");

      if (!username || !password) return resolve();

      if (await validateDetails(username, password)) {
        setKey(password);
        setUsername(username)
      }

      resolve();
    })();
  }, []);

  async function Login() {
    const pass = await makeHash(password);

    const auth = await validateDetails(username, pass);

    console.log(auth);

    if (auth === true) {
      setKey(pass);
      setPassword("");

      localStorage.setItem("username", username);
      localStorage.setItem("password", pass);
    } else {
      setStatus([true, "invalid"])
    }
  }

  const [signUser, setSignUser] = useState<string>("");
  const [signPass, setSignPass] = useState<string>("");

  const adminSignUp = () => {
    createAccount(username, key, signUser, signPass)
    setAdminDialog(false)
  };

  return (
    <>
      {(key || !hasCheckedStorage) ? <div className="flex flex-row h-screen w-screen bg-gray-950 text-gray-200">
        {adminDialog && <div className="absolute w-screen h-screen bg-gray-950 z-20 flex items-center justify-center">
          <h1 className="z-40 absolute top-1/14 text-xl">~ fancy admin dashboard ~</h1>
          <div className="w-2/3 h-2/3 bg-gray-900 rounded-xl z-30 flex flex-col items-center justify-center gap-3">
            <h1 className="text-xl mb-12 text-lime-300">~ new user ~</h1>
            <div className={`w-3/4 bg-gray-950 p-3 rounded-xl flex flex-row ${inputDisabled ? "brightness-20" : ""}`}>
              <input
                type="text"
                className="
            appearance-none
            bg-transparent
            border-none
            outline-none
            focus:ring-0
            focus:outline-none
            placeholder-gray-700
            w-full
            resize-none
            overflow-hidden
          "
                placeholder="username"
                value={signUser}
                onChange={(e) => setSignUser(e.target.value)}
              />
            </div>
            <div className={`w-3/4 bg-gray-950 p-3 rounded-xl flex flex-row ${inputDisabled ? "brightness-20" : ""}`}>
              <input
                type="password"
                className="
            appearance-none
            bg-transparent
            border-none
            outline-none
            focus:ring-0
            focus:outline-none
            placeholder-gray-700
            w-full
            resize-none
            overflow-hidden
          "
                placeholder="password"
                value={signPass}
                onKeyDown={(e) => {
                  if (e.key === "Enter") adminSignUp()
                }}
                onChange={(e) => setSignPass(e.target.value)}
              />
              <FaArrowRight size={24} className="fill-gray-400 ml-auto" onClick={() => adminSignUp()} />
            </div>
          </div>
        </div>
        }
        {isAdmin && <div className="absolute top-4 right-4 h-12 w-12 bg-gray-800 p-3 text-gray-500 rounded-full cursor-pointer z-10" onClick={() => setAdminDialog(true)}><FaCrown className="h-full w-full pointer-none" /></div>}
        <div className="w-1/5 h-screen bg-gray-950 border-r-4 border-r-gray-900 flex flex-col overflow-scroll p-3 gap-4">
          <div key={"newChat"} className="sticky top-0 bg-gray-900 rounded-xl p-3 select-none cursor-pointer flex flex-row gap-3 px-4 items-center" onClick={() => setChat("new")}><FaPenFancy className="h-2/3" /><h1>New Chat</h1></div>
          {Object.values(chats).map(c => <div key={c.ID} className="bg-gray-900 rounded-xl py-3 px-4 select-none cursor-pointer" onClick={() => setChat(c.ID)}><h1>{c.title}</h1></div>)}
        </div>
        <div className="flex flex-col min-h-screen grow items-center justify-center max-h-screen gap-4 p-6 relative">
          <div className="flex flex-col w-3/4 grow gap-4 overflow-scroll">
            {chats?.[chat]?.messages.map((m, i) =>
              <div className={`bg-gray-900 p-3 rounded-xl max-w-1/2 w-fit h-fit ${m.role === "assistant" ? "self-start text-start" : "self-end text-end"}`} key={i}>
                {m.content.split("\n").map((l, i) => <h1 key={l + i}>{l}</h1>)}
              </div>
            )}
          </div>
          {(chat === "new" || !chat) && <h1 className="absolute text-xl select-none mb-24 text-gray-500">new chat, who dis?</h1>}
          <div className={`w-3/4 bg-gray-900 p-3 rounded-xl flex flex-row ${inputDisabled ? "brightness-20" : ""}`}>
            <input
              type="text"
              className="
            appearance-none
            bg-transparent
            border-none
            outline-none
            focus:ring-0
            focus:outline-none
            placeholder-gray-700
            w-full
            resize-none
            overflow-hidden
          "
              placeholder="type something!"
              value={input}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage()
              }}
              onChange={(e) => setInput(e.target.value)}
              disabled={inputDisabled}
            />
            <FaArrowRight size={24} className="fill-gray-400 ml-auto" onClick={() => sendMessage()} />
          </div>
        </div>
      </div> :

        <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-950 text-gray-400 gap-4">
          <h1 className={status[0] ? "text-red-800" : "text-gray-400"}>~ {status[1]} ~</h1>
          <div className={`w-1/4 bg-gray-900 p-3 rounded-xl flex flex-row ${inputDisabled ? "brightness-20" : ""}`}>
            <input
              type="text"
              className="
            appearance-none
            bg-transparent
            border-none
            outline-none
            focus:ring-0
            focus:outline-none
            placeholder-gray-700
            w-full
            resize-none
            overflow-hidden
          "
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={inputDisabled}
            />
          </div>
          <div className={`w-1/4 bg-gray-900 p-3 rounded-xl flex flex-row ${inputDisabled ? "brightness-20" : ""}`}>
            <input
              type="password"
              className="
            appearance-none
            bg-transparent
            border-none
            outline-none
            focus:ring-0
            focus:outline-none
            placeholder-gray-700
            w-full
            resize-none
            overflow-hidden
          "
              placeholder="password"
              value={password}

              onKeyDown={(e) => {
                if (e.key === "Enter") Login();
              }}
              onChange={(e) => setPassword(e.target.value)}
              disabled={inputDisabled}
            />
            <FaArrowRight size={24} className="fill-gray-400 ml-auto" onClick={() => Login()} />
          </div>
        </div>
      }
    </>
  );
}
