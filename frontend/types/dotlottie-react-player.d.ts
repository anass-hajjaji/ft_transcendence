
declare module '@dotlottie/react-player' {

  import * as React from 'react';

  export interface DotLottiePlayerProps extends React.ComponentProps<'div'> {

    src?: string | undefined;

    autoplay?: boolean | undefined;

    loop?: boolean | undefined;

    className?: string | undefined;

  }

  export const DotLottiePlayer: React.FC<DotLottiePlayerProps>;

  export default DotLottiePlayer;

}

