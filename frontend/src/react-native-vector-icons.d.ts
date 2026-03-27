declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import { Component } from 'react';
  import { ViewProps } from 'react-native';

  interface IconProps extends ViewProps {
    name: string;
    size?: number;
    color?: string;
  }

  export default class MaterialCommunityIcons extends Component<IconProps> {}
}

declare module 'react-native-vector-icons/FontAwesome' {
  import { Component } from 'react';
  import { ViewProps } from 'react-native';

  interface IconProps extends ViewProps {
    name: string;
    size?: number;
    color?: string;
  }

  export default class FontAwesome extends Component<IconProps> {}
}
