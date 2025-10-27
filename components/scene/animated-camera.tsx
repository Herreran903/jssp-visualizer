"use client";

import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3, Euler, Quaternion } from "three";

const INITIAL_POS = new Vector3(-2, 5, 6);
const TOP_DOWN_POS = new Vector3(-1.95, 5.56, 2.56);
const INITIAL_ROT = new Euler(-0.4, -0.02, -0.02);
const TOP_DOWN_ROT = new Euler(-0.7, -0.0, -0.0);
const INITIAL_QUAT = new Quaternion().setFromEuler(INITIAL_ROT);
const TOP_DOWN_QUAT = new Quaternion().setFromEuler(TOP_DOWN_ROT);

export function AnimatedCamera({ isTopDown }: { isTopDown: boolean }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.copy(INITIAL_POS);
    camera.quaternion.copy(INITIAL_QUAT);
  }, [camera]);

  useFrame(() => {
    const targetPosition = isTopDown ? TOP_DOWN_POS : INITIAL_POS;
    const targetQuaternion = isTopDown ? TOP_DOWN_QUAT : INITIAL_QUAT;

    camera.position.lerp(targetPosition, 0.05);
    camera.quaternion.slerp(targetQuaternion, 0.05);
  });

  return null;
}
