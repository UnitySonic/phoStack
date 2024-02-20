import { useQuery } from '@tanstack/react-query';
import { fetchAbout } from '../util/about';

function About() {
    // Get our team members from the database
    const { data, error, isLoading } = useQuery({
      queryKey: ['about'],
      queryFn: fetchAbout,
    });

    if (error) {
      return <p>Error: {error.message}</p>;
    }
    
    if (isLoading) {
      return <p>Loading...</p>;
    }

    // Format and Display Team Information
    const teamInformation = data.map((info, index) => (
      <li key={index} style={{ listStyle: 'none' }}>
        <h1>We are Team #{info.teamNumber} - {info.teamName}!</h1>
        <h2>Version #{info.versionNumber}</h2>
        <h3>Release Date: {new Date(info.releaseDate).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</h3>
        <h3>{info.productName}</h3>
        <p>{info.productDescription}</p>
      </li>
  ));
    return ( 
        <>
          <p>{teamInformation}</p>
        </>
      );
  }
  
  export default About;
  