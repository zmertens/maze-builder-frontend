
import { Link } from 'react-router-dom';
import { CSSProperties } from 'react';

const headerTabStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    flexWrap: 'nowrap',
    listStyle: 'none',
    padding: '0 100px',
    };

const Header = () => {
  return (
    <header>
      <nav>
        <Tabs />
      </nav>
    </header>
  );
};

const Tabs = () => {
  const tabs = ["About", "Resources", "GitHub"];
  return (
    <ul style={headerTabStyle}>
      {tabs.map(tab => (
        <Tab key={tab} label={tab} />
      ))}
    </ul>
  );
};

const Tab = ({ label }: {label: string}) => {
  return (
    <li>
        <Link to={`/${label.toLowerCase()}`}>{label}</Link>
    </li>
  );
};

export default Header;
