export type PackageJson = {
  name: string;
  version: string;
  description: string;
};
export declare const kurage: {
  parsePackageJson: () => PackageJson;
};
export default kurage;
