// Import the original mapper
import MDXComponents from '@theme-original/MDXComponents';
import Highlight from '@site/src/components/Highlight';

export default {
    ...MDXComponents,
    Highlight, // 这将使其在每个 MDX/MD 文件中自动可用，而无需任何导入语句。
};