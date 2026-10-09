import OrbGyro from '@/components/originkit/ui/particle-gimbal';

interface LoaderProps {
  /** Pixel size of the gimbal (square). */
  size?: number;
  /** Cover the nearest positioned parent with a centered overlay. */
  overlay?: boolean;
}

/**
 * App-wide loading indicator (Originkit Particle Gimbal).
 * Use this anywhere something is loading.
 */
export function Loader({ size = 120, overlay = true }: LoaderProps) {
  const gimbal = <OrbGyro width={size} height={size} />;

  if (!overlay) return gimbal;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center">
      {gimbal}
    </div>
  );
}

export default Loader;
