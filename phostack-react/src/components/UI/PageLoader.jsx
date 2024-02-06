import classes from "./PageLoader.module.css"

const PageLoader = () => {
  const loadingImg = 'https://cdn.auth0.com/blog/hello-auth0/loader.svg';

  return (
    <div className={classes.loader}>
      <img src={loadingImg} alt='Loading...' />
    </div>
  );
};

export default PageLoader;
