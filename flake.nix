{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    nixpkgs,
    flake-utils,
    ...
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {inherit system;};
      in {
        packages = {
          nodejs = pkgs.nodejs-slim;
          pnpm = pkgs.pnpm;
          default = pkgs.nodejs-slim;
        };
        devShells = {
          default = pkgs.mkShell {
            buildInputs = with pkgs; [
              nodejs-slim
              pnpm
            ];
            shellWrapper = pkgs.writeShellScript "dev-shell" ''
              exec ${pkgs.zsh}/bin/zsh "$@"
            '';
          };
        };
      }
    );
}
