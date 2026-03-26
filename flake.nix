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
          nodejs = pkgs.nodejs_slim_latest;
          bun = pkgs.bun;
          default = pkgs.nodejs_slim_latest;
        };
        devShells = {
          default = pkgs.mkShell {
            buildInputs = with pkgs; [
              nodejs-slim_latest
              bun
            ];
            shellWrapper = pkgs.writeShellScript "dev-shell" ''
              exec ${pkgs.zsh}/bin/zsh "$@"
            '';
          };
        };
      }
    );
}
