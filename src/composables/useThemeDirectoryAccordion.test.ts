import { describe, expect, it } from 'vitest'
import { useThemeDirectoryAccordion } from './useThemeDirectoryAccordion'

describe('useThemeDirectoryAccordion', () => {
  it('keeps only one section and one topic expanded', () => {
    const directory = useThemeDirectoryAccordion('single-open-path')

    directory.toggleSection('booking')
    directory.toggleTopic('reservation-by-phone')

    expect(directory.expandedSectionId.value).toBe('booking')
    expect(directory.expandedTopicId.value).toBe('reservation-by-phone')

    directory.toggleTopic('booking-inquiries')

    expect(directory.expandedTopicId.value).toBe('booking-inquiries')
  })

  it('collapses its topic when the section closes or changes', () => {
    const directory = useThemeDirectoryAccordion('collapse-behavior')

    directory.setExpandedPath('booking', 'reservation-by-phone')
    directory.toggleSection('booking')

    expect(directory.expandedSectionId.value).toBeNull()
    expect(directory.expandedTopicId.value).toBeNull()

    directory.setExpandedPath('booking', 'reservation-by-phone')
    directory.toggleSection('check-in')

    expect(directory.expandedSectionId.value).toBe('check-in')
    expect(directory.expandedTopicId.value).toBeNull()
  })

  it('can restore an expanded path from a legacy route', () => {
    const directory = useThemeDirectoryAccordion('legacy-route')

    directory.setExpandedPath('booking', 'reservation-by-phone')

    expect(directory.expandedSectionId.value).toBe('booking')
    expect(directory.expandedTopicId.value).toBe('reservation-by-phone')
  })

  it('keeps the last expanded path when the same theme is opened again', () => {
    const firstVisit = useThemeDirectoryAccordion('accommodation-memory')
    firstVisit.setExpandedPath('01.2', '01.2.02')

    const returnVisit = useThemeDirectoryAccordion('accommodation-memory')

    expect(returnVisit.expandedSectionId.value).toBe('01.2')
    expect(returnVisit.expandedTopicId.value).toBe('01.2.02')
  })

  it('keeps different theme directories independent', () => {
    const accommodation = useThemeDirectoryAccordion('theme-accommodation')
    const airport = useThemeDirectoryAccordion('theme-airport')

    accommodation.setExpandedPath('01.2', '01.2.02')
    airport.setExpandedPath('02.1', '02.1.01')

    expect(accommodation.expandedSectionId.value).toBe('01.2')
    expect(accommodation.expandedTopicId.value).toBe('01.2.02')
    expect(airport.expandedSectionId.value).toBe('02.1')
    expect(airport.expandedTopicId.value).toBe('02.1.01')
  })
})
