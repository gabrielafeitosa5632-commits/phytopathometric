import logoPng from './Gemini_Generated_Image_2e1ezq2e1ezq2e1e.png';

interface AppLogoProps {
  size?: number;
  className?: string;
}

export function AppLogo({ size = 48, className }: AppLogoProps) {
  return (
    <img
      src={logoPng}
      width={size}
      height={size}
      className={className}
      alt="PhytoPathometric logo"
      style={{ objectFit: 'contain' }}
    />
  );
}

export default AppLogo;
