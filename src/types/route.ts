/* eslint-disable @typescript-eslint/ban-types */
import { SvgIconTypeMap } from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import React from 'react';

type TComponent = React.LazyExoticComponent<() => JSX.Element> | (() => JSX.Element);

export interface IRoute {
  path: string;
  component: TComponent;
  name: string;
  layout?: (props: { children: JSX.Element }) => JSX.Element;
  permission?: string[];
  id?: string;
}

export interface IMenuRoute {
  title: string;
  icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>> & {
    muiName: string;
  };
  activeIcon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>> & {
    muiName: string;
  };
  path: string;
  subMenu?: IMenuRoute[];
  permission?: string[];
  id?: string;
}
