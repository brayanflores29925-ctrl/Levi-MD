/**
 * Shin-MD - https://github.com/riokuroxi-svg/Shin-MD
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 * Parte de Shin-MD. Mantener este header es obligatorio por AGPL.
 */
// Avatar propio (local): antes apuntaba a un imgur de la base.
const DEFAULT_AVATAR_URL = new URL('../../assets/imagenes/levi-avatar.jpg', import.meta.url).pathname;

export function getDefaultAvatar() {
  return DEFAULT_AVATAR_URL;
}

// Función callable y a la vez compatible como string (toString/valueOf)
function defaultAvatar() {
  return DEFAULT_AVATAR_URL;
}
defaultAvatar.url = DEFAULT_AVATAR_URL;
defaultAvatar.toString = () => DEFAULT_AVATAR_URL;
defaultAvatar.valueOf = () => DEFAULT_AVATAR_URL;

export default defaultAvatar;
