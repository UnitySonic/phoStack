import { useQuery } from '@tanstack/react-query';
import styles from './About.module.css';

function About() {
    // Get our team members from the database
    const fetchData = async () => {
      const url = `${import.meta.env.VITE_EXPRESS_BACKEND_URL}/about`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'content-type': 'application/json'
        },
      });
  
      if (!response.ok) {
        const error = new Error('An error occurred while fetching the events');
        error.code = response.status;
        error.info = await response.json();
        throw error;
      }
  
      const { about } = await response.json();
  
      return about;
    };

    const { data, error, isLoading } = useQuery({
      queryKey: ['about'],
      queryFn: fetchData,
    });

    if (error) {
      return <p>Error: {error.message}</p>;
    }
    
    if (isLoading) {
      return <p>Loading...</p>;
    }

    // Format and Display Team Information
    const teamInformation = data.map((info, index) => (
      <li key={index}>
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
  