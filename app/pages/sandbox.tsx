import {useState} from 'react';

import WalletPanel from "../components/WalletPanel";

export default function Sandbox(){
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={()=>setOpen(true)}>Open Wallet Panel</button>
      <WalletPanel 
        open={open}
        onClose={()=>setOpen(false)}
      />
    </div>
    
  )
}