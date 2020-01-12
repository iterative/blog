import { ReactNode } from 'react';

interface IConditionalWrapperProps {
  condition?: boolean;
  wrapper: (children: ReactNode) => ReactNode;
  children: ReactNode;
}

const ConditionalWrapper: any = ({
  condition,
  wrapper,
  children
}: IConditionalWrapperProps) => (condition ? wrapper(children) : children);

export default ConditionalWrapper;
