import { Login } from '@effects/login';
import bg01 from '../../assets/imgs/bg_01.png';
import bg02 from '../../assets/imgs/bg_02.png';
import logo from '../../assets/imgs/logo_01.png';
import slogen01 from '../../assets/imgs/slogen_01.png';
import slogen02 from '../../assets/imgs/slogen_02.png';
import slogen03 from '../../assets/imgs/slogen_03.png';

const LoginPage = () => {
  const images = {
    bg01,
    bg02,
    logo,
    slogen01,
    slogen02,
    slogen03,
  };

  return <Login images={images} />;
};

export default LoginPage;
