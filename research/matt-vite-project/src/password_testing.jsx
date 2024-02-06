import React, {useState} from "react";

export function Password(){
    let passLength = 20;
    const [password, setPassword] = useState("enter password")
    function submitForm(val){
        if(val.length >= passLength)
            alert("Your password is too long!")
        else{
            alert("Your password is: " + val)
        }
        console.log(val)
    }
    return(
        <div>
            <h3>Enter your password</h3>
            <input 
                className= "PasswordField" 
                value={password}
                onChange={e=>
                    {setPassword(e.target.value)}
                }
            />
            <button type="button"
                onClick={e=>submitForm(password)}
                >Submit
            </button>

        </div>
        
    )
}