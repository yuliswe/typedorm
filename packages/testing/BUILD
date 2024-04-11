load("//:tools/defaults.bzl", "setup_ts_build")
load("//:tools/pkg.bzl", "typedorm_package")

setup_ts_build(
    name = "library",
    visibility = [
        "//packages:__subpackages__"
    ],
    tsconfig_cjs = "//:tsconfig_cjs",
    tsconfig_esm = "//:tsconfig_esm",    
    deps = [
        "//packages/common:library",
        "//packages/core:library",
        "@npm//@types/jest",
        "@npm//aws-sdk",
        "@npm//typescript-transform-paths",
    ],
)

typedorm_package(
    name = "testing",
    package_name = "@yuliswe-typedorm/testing",
    readme_md = "README.md",
    deps = [
        ":library",
    ],
)
