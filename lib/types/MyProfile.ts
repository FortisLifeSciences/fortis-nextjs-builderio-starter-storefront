export interface ProfileDetails {
  firstName?: string
  lastName?: string
  emailAddress?: string
  companyOrOrganization?: string
  currentPassword?: string
  newPassword?: string
}

export interface PasswordTypes {
  oldPassword?: string
  newPassword?: string
}

export type ProfileFormNameParam = Pick<
  ProfileDetails,
  'firstName' | 'lastName' | 'companyOrOrganization'
>
export type ProfileFormEmailParam = Pick<ProfileDetails, 'emailAddress'>

export type UpdateProfileDataParam = ProfileFormNameParam & ProfileFormEmailParam & PasswordTypes
