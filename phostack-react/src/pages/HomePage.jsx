import LoginButton from '../components/buttons/LoginButton';
import LogoutButton from '../components/buttons/LogoutButton';
import SignupButton from '../components/buttons/SignupButton';
import Dashboard from '../components/Dashboard';
import {Link} from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react';




const handleUpload = (file) => {
  // Do something with the uploaded file, for example, display it
  console.log('Uploaded file:', file);
};

function HomePage() {
  const { isAuthenticated } = useAuth0();



  let username = "User"
  if(isAuthenticated){
    username = useAuth0().user.nickname

  }



  return (
    <>
      {!isAuthenticated && (
        //do some shit like BMW home page
        <>
          <h1>Sign up for PhoStack!</h1>
          <h2>Who we are:</h2>
          <p>Learn more about us by clicking this link:
            <div><Link to="about" relative="path">Read more</Link></div>
          </p>
          <h3>
            Business Friendly
          </h3>
          <p>
            Easily access tools to manage drivers
          </p>
          <h3>
            Driver Incentives
          </h3>
          <p>
            Drivers can purchase items with points
          </p>
          <h3>
            View statistics from our dashboard
          </h3>
          <p>Sign in to access dashboard</p>

        </>
      )}
      {isAuthenticated && (
        <>
          <h1>Welcome, {username}</h1>
          <Dashboard/>
          
        </>
    
      )}
    </>
  );
}

export default HomePage;
