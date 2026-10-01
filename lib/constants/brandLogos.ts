import abcore from '@/public/Brand_Logo/abcore-logo.png'
import arista from '@/public/Brand_Logo/arista-logo.png'
import bethyl from '@/public/Brand_Logo/bethyl-logo.png'
import empirical from '@/public/Brand_Logo/empirical-logo.png'
import fortis from '@/public/Brand_Logo/fortis-logo.png'
import ipoc from '@/public/Brand_Logo/ipoc-logo.png'
import nanocomposix from '@/public/Brand_Logo/nanocomposix-logo.png'
import vector from '@/public/Brand_Logo/vector-logo.png'
import abcoreWhite from '@/public/Brand_Logo/white/abcore-logo-white.png'
import aristaWhite from '@/public/Brand_Logo/white/arista-logo-white.png'
import bethylWhite from '@/public/Brand_Logo/white/bethyl-logo-white.png'
import empiricalWhite from '@/public/Brand_Logo/white/empirical-logo-white.png'
import fortisWhite from '@/public/Brand_Logo/white/fortis-logo-white.png'
import nanocomposixWhite from '@/public/Brand_Logo/white/nanocomposix-logo-white.png'
import vectorWhite from '@/public/Brand_Logo/white/vector-logo-white.png'
import abcoreLogo from '@/public/BrandLogos/abcore_logo.png'
import aristaLogo from '@/public/BrandLogos/arista_logo.png'
import bethylLogo from '@/public/BrandLogos/bethyl_logo.png'
import empiricalLogo from '@/public/BrandLogos/empirical_logo.png'
import nanocomposixLogo from '@/public/BrandLogos/nanocomposix_logo.png'
import vectorLogo from '@/public/BrandLogos/vector_logo.png'

export const brandImages: Record<string, string> = {
  arista: arista.src,
  bethyl: bethyl.src,
  abcore: abcore.src,
  empirical: empirical.src,
  nanocomposix: nanocomposix.src,
  vector: vector.src,
  ipoc: ipoc.src,
  fortis: fortis.src,
}

export const pdpBrandLogos: Record<string, string> = {
  arista: aristaLogo.src,
  bethyl: bethylLogo.src,
  abcore: abcoreLogo.src,
  empirical: empiricalLogo.src,
  nanocomposix: nanocomposixLogo.src,
  vector: vectorLogo.src,
}

export const getBrandImage = (brand?: string | null): string | undefined =>
  brand ? brandImages[brand.toLowerCase()] : undefined

export const getPdpBrandLogo = (brand?: string | null): string | undefined =>
  brand ? pdpBrandLogos[brand.toLowerCase()] : undefined

export const brandImagesWhite: Record<string, string> = {
  fortis: fortisWhite.src,
  arista: aristaWhite.src,
  bethyl: bethylWhite.src,
  abcore: abcoreWhite.src,
  empirical: empiricalWhite.src,
  nanocomposix: nanocomposixWhite.src,
  vector: vectorWhite.src,
}

export const getBrandImageWhite = (brand?: string | null): string | undefined =>
  brand ? brandImagesWhite[brand.toLowerCase()] : undefined
