import CountUpModule from 'react-countup';
const CountUp = CountUpModule.default || CountUpModule;

const StatsCounter = ({ end, suffix = "", duration = 2.5, className = "" }) => {
  return (
    <CountUp
      end={end}
      suffix={suffix}
      duration={duration}
      enableScrollSpy={true}
      scrollSpyOnce={true}
      className={className}
    />
  );
};

export default StatsCounter;
