export type PackageJson = {
  name: string;
  version: string;
  description: string;
};
export declare const kurage: {
  getPackageJson: () => PackageJson;
};
export default kurage;
